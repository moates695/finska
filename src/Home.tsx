import { View, Text, Button, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from './store';

export default function Home({ navigation }) {
  const status = useSelector((state: RootState) => state.game.status);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Home Screen</Text>
      {status && <Button title="continue" onPress={() => navigation.navigate('Game')}/>}
      <Button title="new game" onPress={() => navigation.navigate('Setup')} />
    </View>
  )
}