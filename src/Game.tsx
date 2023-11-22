import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import PlayerDetailGroup from './PlayerDetailGroup';

export default function Game({ navigation }: any) {

  return (
    <View style={styles.centeredView}>
      <PlayerDetailGroup />
      <Button title="home" onPress={() => navigation.navigate('Home')} />
      <Button title="add player" onPress={() => navigation.navigate('Setup')} />
      <Button title="settings" onPress={() => navigation.navigate('Settings')} />
    </View>
  )
}

const styles = StyleSheet.create({
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
      paddingTop: 100,
      marginBottom: 50,
    },
  });