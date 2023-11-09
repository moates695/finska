import { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { checkInvalidName } from './helper';
import { addPlayer, setGameStatus } from './gameSlice';
import PlayerListGroup from './PlayerListGroup';

interface AddPlayerProps {
  temp: boolean
}

export default function AddPlayer(props: AddPlayerProps) {
  const { temp } = props;
  const players = useSelector((state: RootState) => state.game.players);
  const dispatch = useDispatch();

  const [name, setName] = useState<string>('');
  const [invalidName, setInvalidName] = useState<boolean>(true);
  const [tempPlayers, setTempPlayers] = useState<string[]>([]);

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
    if (temp) {
      setTempPlayers([...tempPlayers, trimmed]);
    } else {
      dispatch(addPlayer(trimmed));
    }
    setName('');
    setInvalidName(true);
  }
  
  return (
    <>
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
      </View>
    </>
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