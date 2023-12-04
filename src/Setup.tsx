import { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'
import { addPlayer, updateGameStatus } from './appSlice'
import PlayerListGroup from './PlayerListGroup';
import { RootState } from './store';
import { checkInvalidName } from './helper';

export default function Setup({ navigation }: any) {
  const players = useSelector((state: RootState) => state.app.game.players);
  const dispatch = useDispatch();

  const [validStart, setValidStart] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [invalidName, setInvalidName] = useState<boolean>(true);

  function handleDone() {
    // dispatch(updateGameStatus('active'));
    navigation.navigate('Game');
  }

  function handleInputChange(text: string) {
    const name = text.trimStart();
    setName(name);
    setInvalidName(checkInvalidName(name, players));
  }

  function handleAdd() {
    const trimmed = name.trim();
    if (checkInvalidName(trimmed, players)) {
      setName(trimmed);
      setInvalidName(true);
      return;
    }
    dispatch(addPlayer(trimmed));
    setName('');
    setInvalidName(true);
  }

  useEffect(() => {
    setValidStart(players.length > 1);
  }, [players]);

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <PlayerListGroup />
      </View>
      <View style={styles.box}>
        <Text>Setup Screen</Text>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8, width: 150 }}
          placeholder="new player"
          onChangeText={handleInputChange}
          onSubmitEditing={handleAdd}
          value={name}
          clearButtonMode="while-editing"
        />
        <Button title="add" onPress={handleAdd} disabled={invalidName}/>
        <Button title="done" onPress={handleDone} disabled={!validStart}/>
        {/* <Button title="back" onPress={() => navigation.goBack()} /> */}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
    },
    nameContainer: {
      marginVertical: 10,
    },
    box: {
      flex: 1,
      marginVertical: 10,
    },
  });