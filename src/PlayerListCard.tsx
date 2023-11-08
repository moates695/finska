import { Text, StyleSheet, View, TouchableOpacity, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { deletePlayer, editName } from './gameSlice';
import { useState } from 'react';

interface PlayerListCardProps {
  original: string,
}

export function PlayerListCard({ original }: PlayerListCardProps) {
  const players = useSelector((state: RootState) => state.game.players)
  const dispatch = useDispatch();

  const [name, setName] = useState(original);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [invalidNewName, setInvalidNewName] = useState(true);

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
    if (invalidNewName) {
      setEditing(false);
      setNewName('');
      return;
    };
    dispatch(editName({ name: name, newName: newName }));
    setName(newName);
    setEditing(false);
    setNewName('');
    setInvalidNewName(true);
  }

  function handleEditChange(text: string) {
    setNewName(text);
    let found = false;
    players.forEach((player) => {
      if (player.name === newName) {
        found = true;
      }
    });
    if (found || text === '') {
      setInvalidNewName(true);
    } else {
      setInvalidNewName(false);
    }
  }
  
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => handleDelete}>
        <Text style={styles.buttonText}>del</Text>
      </TouchableOpacity>
      {editing ? (
        <>
          <TextInput
            style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8, width: 150 }}
            placeholder={name}
            onChangeText={handleEditChange}
            onSubmitEditing={handleDone} // TODO stop duplicate names (reset to old name instead or block submit)
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