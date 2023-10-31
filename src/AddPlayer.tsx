import { View, Text, Button } from 'react-native';

export default function AddPlayer({ navigation }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Add Player</Text>
            <Button title="done" onPress={() => navigation.navigate('Game')} />
        </View>
    )
}