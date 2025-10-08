import { StatusBar } from 'expo-status-bar';
import { useAtom, useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { gameAtom, initialGame, loadableGameAtom } from './store/general';
import LoadingScreen from './components/LoadingScreen';
import { generalStyles } from './styles/general';
import AddParticipant from './components/AddParticipant';

// need to show:
// players current scores (modal scoreboard?)
// current players turn and who is up next
// numeric input or pin input for each turn
// which players are eliminated
// player miss count out of elimination num
// for players within scoring distance, the number of points they need to score

export default function App() {
  const loadableGame = useAtomValue(loadableGameAtom);
  const [game, setGame] = useAtom(gameAtom);

  // if game already started, show options for continuing or starting new game
  
  const [showNewParticipant, setShowNewParticipant] = useState<boolean>(false);

  if (loadableGame.state === 'loading') {
    return <LoadingScreen />;
  } else if (loadableGame.state === 'hasError') {
    console.log('could not load game state');
    setGame({...initialGame});
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <TouchableOpacity
        onPress={() => setShowNewParticipant(!showNewParticipant)}
        style={generalStyles.button}
      >
        <Text>new player</Text>
      </TouchableOpacity>
      {showNewParticipant &&
        <AddParticipant />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffedaaff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
