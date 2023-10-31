import { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import type { RootState } from './store'
import { useSelector, useDispatch } from 'react-redux'
import { addPlayer } from './gameSlice'

export default function Setup({ navigation }) {
    const players = useSelector((state: RootState) => state.game.players)
    const [name, setName] = useState('');
    const dispatch = useDispatch()

    function handleInputChange(text: string) {
        setName(text);
    }

    function handleSubmit() {
        dispatch(addPlayer(name));
        setName('');
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {players.map((data, index) => (
                <View style={styles.nameContainer} key={index}>
                <Text>{data.name}</Text>
                </View>
            ))}
            <Text>Setup Screen</Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8, width: 150 }}
                placeholder="Type something..."
                onChangeText={handleInputChange}
                value={name}
                clearButtonMode="while-editing"
            />
            <Button title="add" onPress={handleSubmit} />
            <Button title="done" onPress={() => navigation.navigate('Game')} />
            <Button title="back" onPress={() => navigation.navigate('Home')} />
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
  });