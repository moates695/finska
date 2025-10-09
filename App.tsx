import { StatusBar } from 'expo-status-bar';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { gameAtom, initialGame, initialLoadAtom, loadableGameAtom, screenAtom, ScreenType, showNewParticipantModalAtom } from './store/general';
import LoadingScreen from './components/LoadingScreen';
import { generalStyles } from './styles/general';
import AddParticipant from './components/AddParticipantModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { MaterialIcons, AntDesign, Ionicons, Feather } from '@expo/vector-icons';
import StartOptions from './components/StartOptions';
import Game from './components/Game';
import GameSetup from './components/GameSetup';

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
  const [initialLoad, setInitialLoad] = useAtom(initialLoadAtom);
  const [screen, setScreen] = useAtom(screenAtom);

  //! todo update this with new Font sources
  const loadFonts = async () => {
    await Font.loadAsync({
      ...MaterialIcons.font,
      ...AntDesign.font,
      ...Ionicons.font,
      ...Feather.font,
    });
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        loadFonts()
      ])
      setInitialLoad(false);
    };
    load();
  }, []);

  if (loadableGame.state === 'loading' || initialLoad) {
    return <LoadingScreen />;
  } else if (loadableGame.state === 'hasError') {
    console.log('could not load game state');
    setGame({...initialGame});
  } else if (loadableGame.state === 'hasData') {
    if (game.has_game_started) {
      setScreen('start options');
      // setShowNewParticipantModal(false);
    }
  }

  const screenMap: Record<ScreenType, JSX.Element> = {
    'start options': <StartOptions />,
    'game setup': <GameSetup />,
    'game': <Game />
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      {screenMap[screen]}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffedaaff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 50,
  },
});
