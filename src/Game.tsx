import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Modal } from 'react-native';
import PlayerDetailGroup from './PlayerDetailGroup';
import ScoreInput from './ScoreInput';
import { useDispatch, useSelector } from 'react-redux';
import { newGame, continueGame } from './appSlice';

export default function Game({ navigation }: any) {
  const gameStatus = useSelector((state: any) => state.app.game.status);
  const players = useSelector((state: any) => state.app.game.players);
  const settings = useSelector((state: any) => state.app.settings);
  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (gameStatus === 'active') return;
    setModalVisible(true);
  }, [gameStatus])

  type ModalButtonInput = 'leave' | 'continueWon' | 'continueLost';

  function handleModalButton(input: ModalButtonInput) {
    setModalVisible(false);
    if (input === 'leave') {
      dispatch(newGame());
      navigation.navigate('Home');
      return;
    }
    dispatch(continueGame(input === 'continueWon'));
  }

  function determineWinner() {
    for (const player of players) {
      if (player.score !== settings.target) continue;
      return player.name;
    }
    return null;
  }

  // TODO add ability to undo current game state (and then redo it if desired like ctrl+z / ctrl+shift+z)
  return (
    <View style={styles.centeredView}>
      <PlayerDetailGroup />
      <ScoreInput />
      <Text>Target: {settings.target} Reset: {settings.reset}</Text>
      <Button title="home" onPress={() => navigation.navigate('Home')} />
      <Button title="add player" onPress={() => navigation.navigate('Setup')} />
      <Button title="settings" onPress={() => navigation.navigate('Settings')} />
      <Modal visible={modalVisible} onRequestClose={() => setModalVisible(!modalVisible)}>
        <View style={styles.centeredView}>
          <Text>Game Over!</Text>
          {gameStatus === 'won' ? 
            <Text>{determineWinner()} wins!</Text> : 
            <Text>There are no winners here!</Text>}
          <Button title='continue' onPress={() => handleModalButton(gameStatus === 'won' ? 'continueWon' : 'continueLost')}/>
          <Button title='leave' onPress={() => handleModalButton('leave')}/>
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