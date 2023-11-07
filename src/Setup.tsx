import { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux'
import { addPlayer } from './gameSlice'
import PlayerListGroup from './PlayerListGroup';
import { RootState } from './store';

export default function Setup({ navigation }) {
  const players = useSelector((state: RootState) => state.game.players)
  
  const [name, setName] = useState('');
  const [collision, setCollision] = useState(false);
  const dispatch = useDispatch()

  function handleInputChange(text: string) {
    setName(text);
    let found = false;
    players.forEach((player) => {
      if (player.name === text) {
        found = true;
        setCollision(true);
      }
    });
    if (!found) {
      setCollision(false);
    }
  }

  function handleSubmit() {
    if (collision) return;
    dispatch(addPlayer(name));
    setName('');
  }

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
          onSubmitEditing={handleSubmit}
          value={name}
          clearButtonMode="while-editing"
        />
        {collision ? <Text style={{color: 'red'}}>players cannot have the same name!</Text> : <></>}
        <Button title="add" onPress={handleSubmit} disabled={collision}/>
        <Button title="done" onPress={() => navigation.navigate('Game')} />
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