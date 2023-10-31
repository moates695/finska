import { View, Text, Button } from 'react-native';

export default function Home({ navigation }) {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Home Screen</Text>
            <Button title="continue" onPress={() => navigation.navigate('Game')} />
            <Button title="new game" onPress={() => navigation.navigate('Setup')} />
        </View>
    )
}