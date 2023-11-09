import { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'
import { addPlayer, setGameStatus } from './gameSlice'
import PlayerListGroup from './PlayerListGroup';
import { RootState } from './store';
import { checkInvalidName } from './helper';

export default function Setup({ navigation }) {
  const players = useSelector((state: RootState) => state.game.players);
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [invalidName, setInvalidName] = useState(true);
  const [validStart, setValidStart] = useState(false);

 

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

  function handleDone() {
    dispatch(setGameStatus(true));
    navigation.navigate('Game');
  }

  useEffect(() => {
    setValidStart(players.length > 1);
  }, [players]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <View style={styles.box}>
        <PlayerListGroup />
      </View>
      <View style={styles.box}>
        <Text>Setup Screen</Text>
        <TextInput
          style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8, width: 150 }}
          placeholder="Type something..."
          onChangeText={handleInputChange}
          onSubmitEditing={handleAdd}
          value={name}
          clearButtonMode="while-editing"
        />
        <Button title="add" onPress={handleAdd} disabled={invalidName}/>
        <Button title="done" onPress={handleDone} disabled={!validStart} />
        <Button title="back" onPress={() => navigation.navigate('Home')} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    nameContainer: {
      marginVertical: 10,
    },
    box: {
      flex: 1,
      marginVertical: 10,
    },
  });