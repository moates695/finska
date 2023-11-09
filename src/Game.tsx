import { useState, useEffect } from 'react';
import { View, Text, Button, Modal, StyleSheet } from 'react-native';
import AddPlayer from './AddPlayer';

export default function Game({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);

  function handleModalButton(confirm: boolean) {
    setModalVisible(false);
    if (!confirm) {
      // TODO: add players to game
    }
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Game Screen</Text>
      <Button title="home" onPress={() => navigation.navigate('Home')} />
      <Button title="add player" onPress={() => navigation.navigate('AddPlayer')} />
      <Button title="settings" onPress={() => navigation.navigate('Settings')} />
      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(!modalVisible)}>
        <View style={styles.centeredView}>
          <AddPlayer {...{temp: false}}/>
          <Button title='done' onPress={() => handleModalButton(true)}/>
          <Button title='cancel' onPress={() => handleModalButton(false)}/>
        </View>
      </Modal>
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