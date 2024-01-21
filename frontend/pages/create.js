import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image, Modal, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import base64 from 'react-native-base64';

const CreatePage = ({ route, navigation }) => {

  const { vaultName } = route.params;

  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

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

  const loadObjects = async () => {
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

    const cards = []

    for (var i = 0; i < objects.length; i++) {
      const object = objects[i];
      const card = {
        id: i.toString(),
        imageSource: await getImage(object["_object_name"]),
      };
      cards.push(card);
    }

    setData(cards);
  }

  const getImage = async (object) => {
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

    console.log(response);

    const data = await response.blob().catch((error) => {
      alert("Vault retrieval failed! (blob)");
      return;
    });

    return await blobToBase64(data).catch((error) => {
      alert("Vault retrieval failed! (blobToBase64)");
      return;
    });
  }
  

  useEffect(() => {
    loadObjects();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <View style={styles.item}>
        <View style={styles.imageContainer}>
          <Image source={{uri:`data:image/jpeg;base64,${item.imageSource}` }} style={styles.image} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const handlePress = (item) => {
    setSelectedItem(item);
  };

  const handleClose = () => {
    setSelectedItem(null);
  };

  const [isPlusButtonClicked, setIsPlusButtonClicked] = useState(false);

  const handlePlusButton = () => {
    console.log('Plus button pressed');
  };

  return (
    <View style={styles.container}>
      {/* Plus button */}
      <TouchableOpacity
        style={styles.plusButton}
        onPress={handlePlusButton}
      >
        <Icon name="plus" size={24} color="white" />
      </TouchableOpacity>

      {/* FlatList */}
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.flatList}
      />

      {/* Modal */}
      {selectedItem && (
        <Modal transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <Image source={{uri:`data:image/jpeg;base64,${selectedItem.imageSource}` }} style={styles.enlargedImage} />
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    top: 0, // Set to 0 to position at the absolute top
    right: 20,
    backgroundColor: 'blue',
    borderRadius: 50,
    padding: 10,
    zIndex: 1, // Ensures the plus button stays above the FlatList
  },
});

export default CreatePage;