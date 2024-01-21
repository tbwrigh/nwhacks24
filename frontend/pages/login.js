// Login.js

import React from 'react';
import { View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';

const LoginPage = () => {

// const handleLogin = () => {
//   console.log('Login pressed');
// };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.headerText}>Login</Text>
        <Text style={styles.subText}>Username</Text>
        <TextInput style={styles.textBar} placeholder="Enter your username or email" />
        <Text style={styles.subText}>Password</Text>
        <TextInput style={styles.textBar} placeholder="Enter your password" />
        <TouchableOpacity style={styles.loginButton} onPress={() => {}}>
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
    autoCapitalize: 'none',
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