import { Text, StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { deletePlayer, editName } from './appSlice';
import { useState } from 'react';

import { checkInvalidName } from './helper';

interface PlayerListCardProps {
  original: string,
}

export default function PlayerListCard({ original }: PlayerListCardProps) {
  const players = useSelector((state: RootState) => state.app.game.players)
  const dispatch = useDispatch();

  const [name, setName] = useState<string>(original);
  const [editing, setEditing] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [invalidNewName, setInvalidNewName] = useState<boolean>(true);

  function handleDelete() {
    if (editing) {
      setEditing(false);
      setNewName('');
      setInvalidNewName(true);
    }
    dispatch(deletePlayer(name));
  }

  function handleEdit() {
    setEditing(true);
    setNewName('');
    setInvalidNewName(true);
  }

  function handleDone() {
    setInvalidNewName(checkInvalidName(name.trim(), players));
    setEditing(false);
    setNewName('');
    if (invalidNewName) return;
    dispatch(editName({ name: name, newName: newName }));
    setName(newName);
    
    setInvalidNewName(true);
  }

  function handleEditChange(text: string) {
    setNewName(text);
    setInvalidNewName(checkInvalidName(text, players));
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => handleDelete()}>
        <Text style={styles.buttonText}>del</Text>
      </TouchableOpacity>
      {editing ? (
        <>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8, width: 150 }}
            placeholder={name}
            onChangeText={handleEditChange}
            onSubmitEditing={handleDone}
            value={newName}
            clearButtonMode="while-editing"
          />
          <TouchableOpacity style={styles.button} onPress={() => handleDone()}>
            <Text style={styles.buttonText}>done</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.box}>{name}</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleEdit()}>
            <Text style={styles.buttonText}>edit</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    borderRadius: 5,
    backgroundColor: 'blue'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
