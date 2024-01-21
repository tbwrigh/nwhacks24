// Signup.js

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const SignupPage = ({ navigation }) => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const doSignup = async (username, email, password, confirmPassword, navigation) => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    var headers = new Headers();
    headers.append("Content-Type", "application/json");
    const response = await fetch("http://localhost:8000/signup", {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
      }),
    }).catch((error) => {
      alert("Signup failed! (REQUEST)");
      return;
    });

    if (response.status !== 200) {
      alert("Signup failed! (NOT 200)");
      return;
    }

    navigation.navigate('Login');
  }

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.headerText}>Signup</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.subText}>Username</Text>
          <TextInput style={styles.textBar} onChangeText={text => setUsername(text)} placeholder="Enter your username" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.subText}>Email</Text>
          <TextInput style={styles.textBar} onChangeText={text => setEmail(text)} placeholder="Enter your email" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.subText}>Password</Text>
          <TextInput style={styles.textBar}  onChangeText={text => setPassword(text)} placeholder="Enter your password" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.subText}>Confirm Password</Text>
          <TextInput style={styles.textBar}  onChangeText={text => setConfirmPassword(text)} placeholder="Confirm your password" />
        </View>

        <TouchableOpacity style={styles.signUpButton} onPress={() => doSignup(username, email, password, confirmPassword, navigation)}>
          <Text style={styles.loginButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    flex: 1,
    backgroundColor: 'gray',
    alignSelf: 'stretch',
    marginVertical: '35%',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'flex-start',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  subText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  textBar: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 10,
  },
  loginButton: {
    backgroundColor: 'green',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '50%',
    alignSelf: 'center',
  },
  signUpButton: {
    backgroundColor: 'blue',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '50%',
    alignSelf: 'center',
  },
  loginButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 15,
  },
});

export default SignupPage;