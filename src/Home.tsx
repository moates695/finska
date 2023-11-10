import { useState } from 'react';
import { View, Text, Button, Modal, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { newGame } from './gameSlice';

export default function Home({ navigation }: any) {
  const dispatch = useDispatch();
  const status = useSelector((state: RootState) => state.game.status);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  function handleNewGame() {
    if (!status) {
      navigation.navigate('Setup');
      return;
    }
    setModalVisible(true);
  }

  function handleModalButton(confirm: boolean) {
    setModalVisible(false);
    if (confirm) {
      dispatch(newGame());
      navigation.navigate('Setup');
    }
  }

  // TODO: show current game stats if there is a game, else a welcome message
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      {status && <Button title="continue" onPress={() => navigation.navigate('Game')}/>}
      <Button title="new game" onPress={() => handleNewGame()} />
      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(!modalVisible)}>
        <View style={styles.centeredView}>
          <Text>Are you sure you want to start a new game?</Text>
          <Button title='yep' onPress={() => handleModalButton(true)}/>
          <Button title='no' onPress={() => handleModalButton(false)}/>
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