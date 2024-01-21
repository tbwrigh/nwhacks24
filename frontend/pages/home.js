import React from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const HomePage = () => {
  const data = [
    { id: '1', title: 'Item 1', image: require('../assets/images/birthday.jpg') },
    { id: '2', title: 'Item 2', image: require('../assets/images/mountains.jpg') },
    { id: '3', title: 'Item 3', image: require('../assets/images/purple.jpg') },
    // Add more items as needed
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <View style={styles.item}>
        <Image source={item.image} style={{ width: 100, height: 100 }} />
        <Text>{item.title}</Text>
      </View>
    </TouchableOpacity>
  );

  const handlePress = (item) => {
    // Handle the press event for the selected item
    console.log(`Pressed: ${item.title}`);
  };

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default HomePage;
