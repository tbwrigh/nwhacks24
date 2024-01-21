// Login.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64'


const doLogin = async (username, password, navigation) => {
  var headers = new Headers();
  headers.append("Authorization", "Basic " + base64.encode(username+":"+password));
  const response = await fetch("http://localhost:8000/login", {
    headers: headers,
    method: 'POST',
  })
  if (response.status !== 200) {
    alert("Login failed!");
    return;
  }
  const json = await response.json();
  await AsyncStorage.setItem('session_id', json['session_id'].toString());
  navigation.navigate('Home'); // this is a navigation prop that doesnt work for some reason I think
}

const LoginPage = ({ navigation }) => {
  const [username, setUsername] = useState(''); // Add state for username
  const [password, setPassword] = useState(''); // Add state for password

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.headerText}>Login</Text>
        <Text style={styles.subText}>Username</Text>
        <TextInput style={styles.textBar} autoCapitalize="none" onChangeText={text => setUsername(text)} placeholder="Enter your username or email" />
        <Text style={styles.subText}>Password</Text>
        <TextInput style={styles.textBar} autoCapitalize="none" onChangeText={text => setPassword(text)} placeholder="Enter your password" />
        <TouchableOpacity style={styles.loginButton} onPress={() => {doLogin(username, password, navigation)}}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <Button style={styles.loginButton} title="Sign Up" onPress={() => {}} />
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
    marginVertical: '50%',
    borderRadius: 15,
    padding: 1,
    justifyContent: 'flex-start',
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '20%',
  },
  subText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  textBar: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 10,
  },
  loginButton: {
    backgroundColor: 'green',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '30%',
    alignSelf: 'center',
  },
  loginButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  });

export default LoginPage;