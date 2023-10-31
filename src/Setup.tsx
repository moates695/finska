import { View, Text, Button } from 'react-native';

export default function Setup({ navigation }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Setup Screen</Text>
            <Button title="done" onPress={() => navigation.navigate('Game')} />
            <Button title="back" onPress={() => navigation.navigate('Home')} />
        </View>
    )
}