import { Text, StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { deletePlayer, editName } from './gameSlice';
import { useEffect, useState } from 'react';

interface PlayerListCardProps {
  original: string,
}

export function PlayerListCard({ original }: PlayerListCardProps) {
  const players = useSelector((state: RootState) => state.game.players)
  const dispatch = useDispatch();

  const [name, setName] = useState(original);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  function handleDelete() {
    if (editing) {
      setEditing(false);
      setNewName('');
    }
    dispatch(deletePlayer(name));
  }

  function handleEdit() {
    setEditing(true);
  }

  function handleDone() {
    dispatch(editName({ name: name, newName: newName }));
    setName(newName);
    setEditing(false);
  }

  function handleEditChange(text: string) {
    setNewName(text);
  }
  
  return (
    <>
      {editing ? (
        <View style={styles.container}>
          <TouchableOpacity style={styles.button} onPress={() => handleDelete()}>
            <Text style={styles.buttonText}>del</Text>
          </TouchableOpacity>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8, width: 150 }}
            placeholder={name}
            onChangeText={handleEditChange}
            value={newName}
            clearButtonMode="while-editing"
          />
          <TouchableOpacity style={styles.button} onPress={() => handleDone()}>
            <Text style={styles.buttonText}>done</Text>
          </TouchableOpacity>
        </ View>
      ) : (
        <View style={styles.container}>
          <TouchableOpacity style={styles.button} onPress={() => handleDelete()}>
            <Text style={styles.buttonText}>del</Text>
          </TouchableOpacity>
          <Text style={styles.box}>{name}</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleEdit()}>
            <Text style={styles.buttonText}>edit</Text>
          </TouchableOpacity>
        </ View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 200,
    height: 50,
    backgroundColor: 'lightblue',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'blue',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default PlayerListCard;