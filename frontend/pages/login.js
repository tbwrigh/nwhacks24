// Signup.js

import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const LoginPage = ({ navigation }) => {
  // const handleLogin = () => {
  //   console.log('Login pressed');
  // };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.headerText}>Login</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.subText}>Username</Text>
          <TextInput style={styles.textBar} placeholder="Enter your username or email" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.subText}>Password</Text>
          <TextInput style={styles.textBar} placeholder="Enter your password" />
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={() => {}}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate('Signup')}>
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
    marginVertical: '50%',
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
    autoCapitalize: 'none',
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

export default LoginPage;