import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'


const doLogin = async (username, password, navigation) => {
  var headers = new Headers();
  headers.append("Authorization", "Basic " + base64.encode(username+":"+password));
  const response = await fetch(process.env.EXPO_PUBLIC_API_URL + "/login", {
    headers: headers,
    method: 'POST',
  }).catch((error) => {
    alert("Login failed!");
    return;
  });
  if (response.status !== 200) {
    alert("Login failed!");
    return;
  }
  const json = await response.json().catch((error) => {
    alert("Login failed!");
    return;
  });
  await AsyncStorage.setItem('session_id', json['session_id'].toString()).catch((error) => {
    alert("Login failed!");
    return;
  });
  navigation.navigate('Home'); // this is a navigation prop that doesnt work for some reason I think
}

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState(''); // Add state for username
  const [password, setPassword] = useState(''); // Add state for password

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.headerText}>Login</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.subText}>Username</Text>
          <TextInput style={styles.textBar} autoCapitalize="none" autoCorrect={false} onChangeText={text => setUsername(text)} placeholder="Enter your username or email" />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.subText}>Password</Text>
          <TextInput style={styles.textBar} autoCapitalize="none" autoCorrect={false} onChangeText={text => setPassword(text)} placeholder="Enter your password" secureTextEntry={true} />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={() => {doLogin(username, password, navigation)}}>
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.loginButtonText}>SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4e8f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    flex: 1,
    backgroundColor: 'white',
    alignSelf: 'stretch',
    marginVertical: '50%',
    padding: 20,
    justifyContent: 'center',
    margin: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 30,
    alignSelf: 'center',
  },
  subText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  textBar: {
    height: 50,
    borderColor: '#b0aeae',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    width: '80%',
    alignSelf: 'center',
  },
  loginButton: {
    backgroundColor: 'blue',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '50%',
    alignSelf: 'center',
  },
  signUpButton: {
    backgroundColor: '#8fe3dc',
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

export default LoginPage;