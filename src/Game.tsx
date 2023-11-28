import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Modal } from 'react-native';
import PlayerDetailGroup from './PlayerDetailGroup';
import ScoreInput from './ScoreInput';
import { useDispatch, useSelector } from 'react-redux';
import { newGame, resetWinner } from './appSlice';

export default function Game({ navigation }: any) {
  const gameStatus = useSelector((state: any) => state.app.game.status);
  const players = useSelector((state: any) => state.app.game.players);
  const target = useSelector((state: any) => state.app.settings.target);
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (gameStatus === 'active') return;
    setModalVisible(true);
  }, [gameStatus])

  function handleModalButton(confirm: boolean) {
    setModalVisible(false);
    if (confirm) {
      dispatch(newGame());
      navigation.navigate('Setup');
      return;
    }
    dispatch(resetWinner());    
  }

  function determineWinner() {
    for (const player of players) {
      if (player.score !== target) continue;
      return player.name;
    }
    return null;
  }

  return (
    <View style={styles.centeredView}>
      <PlayerDetailGroup />
      <ScoreInput />
      <Button title="home" onPress={() => navigation.navigate('Home')} />
      <Button title="add player" onPress={() => navigation.navigate('Setup')} />
      <Button title="settings" onPress={() => navigation.navigate('Settings')} />
      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(!modalVisible)}>
        <View style={styles.centeredView}>
          <Text>Game Over!</Text>
          {gameStatus === 'won' ? 
            <Text>{determineWinner()} wins!</Text> : 
            <Text>There are no winners here!</Text>}
          <Button title='continue' onPress={() => handleModalButton(false)}/>
          <Button title='leave' onPress={() => handleModalButton(true)}/>
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
      marginTop: 50,
      paddingTop: 10,
      marginBottom: 30,
    },
  });