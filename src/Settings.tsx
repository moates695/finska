import { View, Text, Button } from 'react-native';

export default function Settings({ navigation }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Settings Screen</Text>
            <Button title="back" onPress={() => navigation.navigate('Game')} />
            <Button title="save" onPress={() => navigation.navigate('Game')} />
        </View>
    )
}