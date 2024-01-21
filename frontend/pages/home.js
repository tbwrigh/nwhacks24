import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image, Modal, TextInput, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const getThumbnail = async (vaultName) => {
  const session_id = await AsyncStorage.getItem('session_id');
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Cookie', 'session_id='+session_id);
  const response = await fetch(process.env.EXPO_PUBLIC_API_URL +'/vault/objects/' + vaultName, {
    headers: headers,
    method: 'GET',
  }).catch((error) => {
    alert("Vault scan failed! (REQUEST)");
    return;
  });
  if (response.status !== 200) {
    alert("Vault scan failed! (not 200)");
    return;
  }
  const data = await response.json().catch((error) => {
    alert("Vault scan failed! (JSON)");
    return;
  });

  const objects = data['objects'];

  if (objects.length == 0) {
    return;
  }

  const object = objects[0];

  return await getImage(vaultName, object["_object_name"])

}

const getImage = async (vaultName, object) => {
  const session_id = await AsyncStorage.getItem('session_id');
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Cookie', 'session_id='+session_id);
  const response = await fetch(process.env.EXPO_PUBLIC_API_URL +'/vault/objects/' + vaultName + '/' + object, {
    headers: headers,
    method: 'GET',
  }).catch((error) => {
    alert("Vault retrieval failed! (REQUEST)");
    return;
  });
  if (response.status !== 200) {
    alert("Vault retrieval failed! (not 200)");
    return;
  }


  const data = await response.blob().catch((error) => {
    alert("Vault retrieval failed! (blob)");
    return;
  });

  const base64 = await blobToBase64(data).catch((error) => {
    alert("Vault retrieval failed! (blobToBase64)");
    return;
  });

  return base64 
}

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // The FileReader has completed reading the blob, resolve the promise with the result
      const base64String = reader.result.replace(/^data:.+;base64,/, '');
      resolve(base64String);
    };
    reader.onerror = error => reject(error); // In case of error with FileReader
    reader.readAsDataURL(blob); // Start reading the blob as DataURL
  });
};

const HomePage = ({ navigation }) => {
  const [data, setData] = useState([]);

  const getVaults = async () => {
    const session_id = await AsyncStorage.getItem('session_id');
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Cookie', 'session_id='+session_id);
    const response = await fetch(process.env.EXPO_PUBLIC_API_URL +'/vaults', {
      headers: headers,
      method: 'GET',
    }).catch((error) => {
      alert("Vault retrieval failed! (REQUEST)");
      return;
    });
    if (response.status !== 200) {
      alert("Vault retrieval failed! (not 200)");
      return;
    }
    const data = await response.json().catch((error) => {
      alert("Vault retrieval failed! (JSON)");
      return;
    });
    const vaults = data['vaults'];
    const cards = []
    for (var i = 0; i < vaults.length; i++) {
      const vault = vaults[i];

      const draft = vault['locked_at'] == null;

      let open = true;

      if (!draft) {
        const open_date = new Date(vault['locked_at']);
        const lock_duration = vault['days_locked_for'];
        const now = new Date();
        const open_date_plus_duration = new Date(open_date.getTime() + lock_duration * 86400000);
        open = now >= open_date_plus_duration;
      }

      let image_uri = false;

      let image = require('../assets/images/lock.svg');

      // if (open) {
      //   image = require('../assets/images/empty.png');
      //   const tmp_image = await getThumbnail(vault['name']);
      //   if (tmp_image != null) {
      //     image = tmp_image;
      //     image_uri = true;
      //   }
      // }

      console.log(vault['name'])
      console.log("image_uri");
      console.log(image_uri);
      console.log(image.substring(0, 100));
      console.log(i)

      const card = {
        id: vault['id'],
        is_draft: draft,
        is_open: open,
        is_uri: image_uri,
        title: vault['name'],
        image: image,
      };
      cards.push(card);
    }
    setData(cards);
  }

  useEffect(() => {

    getVaults();

    const intervalId = setInterval(getVaults, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item, navigation)}>
      <View style={styles.item}>
        <View style={styles.imageContainer}>
        {!item.is_uri && ( <Image source={item.image} style={styles.image} /> )}
        {item.is_uri && ( <Image source={{uri:`data:image/jpeg;base64,${item.image}`}} style={styles.image} /> )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{item.title}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handlePress = async (item, navigation) => {
    if (!item.is_open) {
      return;
    }
    navigation.navigate('Create', {
      vaultName: item.title,
      editable: item.is_draft,
    });
  };

  const [isPlusButtonClicked, setIsPlusButtonClicked] = useState(false);

  const [newVaultTitle, setNewVaultTitle] = useState('');

  const handlePlusButton = () => {
    setIsPlusButtonClicked(true);
  };

  const handleModalClose = () => {
    setIsPlusButtonClicked(false);
    setNewVaultTitle('');
  };

  const handleCreateVault = async (vaultTitle, navigation) => {
    const session_id = await AsyncStorage.getItem('session_id').catch((error) => {
      alert("Vault creation failed! (session_id)");
      handleModalClose();
      return;
    });
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Cookie', 'session_id='+session_id);
    const response = await fetch(process.env.EXPO_PUBLIC_API_URL +'/new-vault', {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        name: vaultTitle,
      }),
    }).catch((error) => {
      alert("Vault creation failed! (REQ)");
      handleModalClose();
      return;
    });

    if (response.status !== 200) {
      alert("Vault creation failed! (PORT)" + response.status);
      handleModalClose();
      return;
    }

    handleModalClose();
    navigation.navigate('Create', {
      vaultName: vaultTitle,
      editable: true,
    });
  };

  const handleLogoutConfirm = async () => {
    const session_id = await AsyncStorage.getItem('session_id').catch((error) => {
      alert("Logout failed!");
      return;
    });

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Cookie', 'session_id='+session_id);

    const response = await fetch(process.env.EXPO_PUBLIC_API_URL +'/logout', {
      method: 'POST',
      headers: headers,
    }).catch((error) => {
      alert("Logout failed!");
      return;
    });

    if (response.status !== 200) {
      alert("Logout failed!");
      return;
    }

    await AsyncStorage.removeItem('session_id').catch((error) => {
      alert("Logout failed!");
      return;
    });
    setIsLogoutModalVisible(false);
    navigation.navigate('Login');
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalVisible(false);
  };

  const handleLogoutButton = () => {
    setIsLogoutModalVisible(true);
  };

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Plus button */}
      <TouchableOpacity
        style={styles.plusButton}
        onPress={handlePlusButton}
      >
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogoutButton}
      >
        <Icon name="sign-out" size={24} color="white" />
      </TouchableOpacity>

      {/* FlatList */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.flatListContainer}
      />

      {/* Modal for entering title */}
      <Modal transparent={true} animationType="slide" visible={isPlusButtonClicked}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Vault Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Vault Title"
              value={newVaultTitle}
              autoCapitalize="none"
              onChangeText={(text) => setNewVaultTitle(text)}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButton} onPress={handleModalClose}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => {handleCreateVault(newVaultTitle, navigation)}}>
                <Text style={styles.buttonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

     {/* Modal for log-out confirmation */}
      <Modal transparent={true} animationType="slide" visible={isLogoutModalVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Log Out</Text>
          <Text>Are you sure you want to log out?</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalButton} onPress={handleLogoutCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={handleLogoutConfirm}>
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4e8f5',
  },
  flatList: {
    flex: 1,
  },
  flatListContainer: {
    flex: 1,
    marginTop: 80,
  },
  item: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  imageContainer: {
    flex: 1,
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  enlargedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
  plusButton: {
    position: 'absolute',
    top: '5%', // Set to 0 to position at the absolute top
    right: 20,
    backgroundColor: 'blue',
    borderRadius: 50,
    padding: 10,
    marginBottom: 20,
    zIndex: 1, // Ensures the plus button stays above the FlatList
  },
  logoutButton: {
    position: 'absolute',
    top: '5%', // Set to 0 to position at the absolute top
    left: 20,
    backgroundColor: 'blue',
    borderRadius: 50,
    padding: 10,
    marginBottom: 20,
    zIndex: 1, // Ensures the plus button stays above the FlatList
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: 10,
    padding: 10,
  },
  buttonText: {
    color: 'blue',
    fontWeight: 'bold',
  },
  profileButton: {
    position: 'absolute',
    top: 0,
    left: 20,
    backgroundColor: 'green',
    borderRadius: 50,
    padding: 10,
    zIndex: 1,
  },  
});

export default HomePage;