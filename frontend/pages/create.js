import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image, Modal, Button } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const CreatePage = () => {
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const dynamicData = [
        { id: '1', title: 'Birthday', image: require('../assets/images/birthday.jpg') },
        { id: '2', title: 'Memories', image: require('../assets/images/mountains.jpg') },
        { id: '3', title: 'Favorites', image: require('../assets/images/purple.jpg') },
        { id: '4', title: 'Vacation', image: require('../assets/images/beaches.jpg') },
      ];

      setData(dynamicData);
    };

    fetchData();

    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <View style={styles.item}>
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{item.title}</Text>
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
            <Image source={selectedItem.image} style={styles.enlargedImage} />
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