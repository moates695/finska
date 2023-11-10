import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Game({ navigation }) {

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Game Screen</Text>
      <Button title="home" onPress={() => navigation.navigate('Home')} />
      <Button title="add player" onPress={() => navigation.navigate('AddPlayer')} />
      <Button title="settings" onPress={() => navigation.navigate('Settings')} />

    </View>
  )
}

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
  });