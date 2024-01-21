from fastapi import FastAPI, Request, Body, HTTPException, status, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.responses import StreamingResponse

from dotenv import load_dotenv
from os import getenv

from pymemcache.client import base

import random

from models.user import User
from models.vault import Vault
from models.share import Share
from db import DB

from minio import Minio

from datetime import timedelta
from datetime import datetime

import base64

load_dotenv()

app = FastAPI()

security = HTTPBasic()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    app.state.db = DB()
    app.state.cache = base.Client((getenv("MEMCACHE_HOST"), int(getenv("MEMCACHE_PORT"))))
    app.state.session_count = 1
    app.state.minio_client = Minio(getenv("MINIO_ENDPOINT"), access_key=getenv("MINIO_ACCESS_KEY"), secret_key=getenv("MINIO_SECRET_KEY"), secure=False)

@app.post("/signup")
def sign_up(username: str = Body(...), email: str = Body(...), password: str = Body(...)):
    with app.state.db.session() as session:
        user = session.query(User).filter(User.username == username).first()
        if user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username already exists",
            )
        email_addr = session.query(User).filter(User.email == email).first()
        if email_addr:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already exists",
            )
        new_user = User(username=username, email=email, password=password)
        session.add(new_user)
        session.commit()

    return {"message": "User registered successfully"}

def authenticate_user(credentials: HTTPBasicCredentials = Depends(security)):
    with app.state.db.session() as session:
        user = session.query(User).filter(User.username == credentials.username).first()
        if user is None or user.password != credentials.password:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Basic"},
            )
        return user

def create_session(user_id: int):
    session_id = random.randint(100000000 * app.state.session_count, 100000000 * (app.state.session_count + 1)-1)
    app.state.session_count += 1
    app.state.cache.set(f"session-{session_id}", user_id)
    return session_id

@app.post("/login")
def login(user: User = Depends(authenticate_user)):
    session_id = create_session(user.id)
    return {"message": "Logged in successfully", "session_id": session_id}

def get_authenticated_user_from_session_id(request: Request):
    session_id = request.cookies.get("session_id")
    if session_id is None or app.state.cache.get(f"session-{session_id}") is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid session ID",
        )
    # Get the user from the session
    user = get_user_from_session(int(session_id))
    return user

# Use the valid session id to get the corresponding user from the users dictionary
def get_user_from_session(session_id: int):
    user_id = app.state.cache.get(f"session-{session_id}")
    if user_id is None:
        return None
    user_id = int(user_id)
    with app.state.db.session() as session:
        user = session.query(User).filter(User.id == user_id).first()
        return user
    
@app.get("/protected")
def protected_endpoint(user: dict = Depends(get_authenticated_user_from_session_id)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    return {"message": "This user can connect to a protected endpoint after successfully autheticated", "user": user}

@app.post("/new-vault")
def new_vault(user: User = Depends(get_authenticated_user_from_session_id), name=Body(...)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    with app.state.db.session() as session:
        vault = session.query(Vault).filter(Vault.user_id == user.id, Vault.name == name['name']).first()
        if vault:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vault with that name already exists")
    bucket_name = f"{user.username}-{name['name']}-{random.randint(100000000, 999999999)}"
    bucket_name = bucket_name.lower()
    app.state.minio_client.make_bucket(bucket_name)
    with app.state.db.session() as session:
        new_vault = Vault(name=name['name'], user_id=user.id, bucket_name=bucket_name)
        session.add(new_vault)
        session.commit()
    return {"message": "Vault created successfully"}

@app.get("/vaults")
def get_vaults(user: User = Depends(get_authenticated_user_from_session_id)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    with app.state.db.session() as session:
        vaults = session.query(Vault).filter(Vault.user_id == user.id).all()
        return {"vaults": vaults}

@app.get("/vault/objects/{vault_name}")
def get_vault(vault_name: str, user: User = Depends(get_authenticated_user_from_session_id)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    with app.state.db.session() as session:
        vault = session.query(Vault).filter(Vault.user_id == user.id, Vault.name == vault_name).first()
        if vault is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault not found")
    
        if vault.locked_at:
            unlock_date = vault.locked_at + timedelta(days=vault.days_locked_for)

            if datetime.now().date() < unlock_date:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vault is locked")


        objects = app.state.minio_client.list_objects(vault.bucket_name)
        return {"objects": objects}

@app.post("/vault/objects/{vault_name}")
async def upload_object(vault_name: str, user: User = Depends(get_authenticated_user_from_session_id), file: UploadFile = File(...)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    with app.state.db.session() as session:
        vault = session.query(Vault).filter(Vault.user_id == user.id, Vault.name == vault_name).first()
        if vault is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault not found")
        
        if vault.locked_at:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vault was locked")

        file_content = await file.read()
        file_size = len(file_content)
        await file.seek(0)
        app.state.minio_client.put_object(vault.bucket_name, file.filename, file.file, length=file_size, content_type=file.content_type)
        return {"message": "File uploaded successfully"}

@app.get("/vault/objects/{vault_name}/{object_name}")
def download_object(vault_name: str, object_name: str, user: User = Depends(get_authenticated_user_from_session_id)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    with app.state.db.session() as session:
        vault = session.query(Vault).filter(Vault.user_id == user.id, Vault.name == vault_name).first()
        if vault is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault not found")

        if vault.locked_at:
            unlock_date = vault.locked_at + timedelta(days=vault.days_locked_for)

            if datetime.now().date() < unlock_date:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vault is locked")
            
        object = app.state.minio_client.get_object(vault.bucket_name, object_name)

        return StreamingResponse(object, media_type="application/octet-stream")
    
@app.post("/vault/lock/{vault_name}")
def lock_vault(vault_name: str, user: User = Depends(get_authenticated_user_from_session_id), duration=Body(...)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    with app.state.db.session() as session:
        vault = session.query(Vault).filter(Vault.user_id == user.id, Vault.name == vault_name).first()
        if vault is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault not found")
        vault.locked_at = datetime.now().date()
        vault.days_locked_for = duration['duration']
        session.commit()
        return {"message": "Vault locked successfully"}
    
@app.post("/logout")
def logout(request: Request):
    session_id = request.cookies.get("session_id")
    if session_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    app.state.cache.delete(f"session-{session_id}")
    return {"message": "Logged out successfully"}

@app.get("/vault/share/{vault_name}")
def get_shares(vault_name: str, user: User = Depends(get_authenticated_user_from_session_id)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    with app.state.db.session() as session:
        vault = session.query(Vault).filter(Vault.user_id == user.id, Vault.name == vault_name).first()
        if vault is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault not found")
        
        shares = session.query(Share).filter(Share.vault_id == vault.id).all()

        return {"shares": shares}

@app.post("/vault/share/{vault_name}")
def share(vault_name: str, user: User = Depends(get_authenticated_user_from_session_id), username=Body(...)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")
    with app.state.db.session() as session:
        vault = session.query(Vault).filter(Vault.user_id == user.id, Vault.name == vault_name).first()
        if vault is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vault not found")
        
        user_to_share = session.query(User).filter(User.username == username['username']).first()
        if user_to_share is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        share = session.query(Share).filter(Share.user_id == user_to_share.id, Share.vault_id == vault.id).first()
        if share:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Vault already shared with this user")
        
        new_share = Share(user_id=user_to_share.id, vault_id=vault.id)
        session.add(new_share)
        session.commit()

        return {"message": "Vault shared successfully"}
    
@app.get("/users")
def get_users(user: User = Depends(get_authenticated_user_from_session_id)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authenticated")

    with app.state.db.session() as session:
        users = session.query(User).all()
        return {"users": users}
