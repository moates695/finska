import { StatusBar } from 'expo-status-bar';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { Keyboard, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { gameAtom, initialGame, initialLoadAtom, loadableGameAtom, loadableThemeAtom, loadableUseDeviceThemeAtom, screenAtom, ScreenType, showNewParticipantModalAtom, themeAtom, useDeviceThemeAtom } from './store/general';
import LoadingScreen from './components/LoadingScreen';
import { generalStyles } from './styles/general';
import AddParticipant from './components/AddParticipantModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { MaterialIcons, AntDesign, Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import StartOptions from './components/StartOptions';
import Game from './components/Game';
import GameSetup from './components/GameSetup';
import Settings from './components/Settings';
import { useColorScheme } from 'react-native';
// import { useTheme } from './styles/useTheme';
import { Theme, themes } from './styles/theme';

export default function App() {
  const loadableGame = useAtomValue(loadableGameAtom);
  const [game, setGame] = useAtom(gameAtom);
  const [screen, setScreen] = useAtom(screenAtom);
  const [initialLoad, setInitialLoad] = useAtom(initialLoadAtom);
  
  const loadableTheme = useAtomValue(loadableThemeAtom);
  const [theme, setTheme] = useAtom(themeAtom);

  const loadableUseDeviceTheme = useAtomValue(loadableUseDeviceThemeAtom);
  const [useDeviceTheme, ] = useAtom(useDeviceThemeAtom);

  const [loadingFonts, setLoadingFonts] = useState<boolean>(false);
  const [loadedTheme, setLoadedTheme] = useState<boolean>(false);

  const colorScheme = useColorScheme();

  const styles = createStyles(theme);

  // const theme = useTheme();
  // const styles = createStyles(theme);

  const loadFonts = async () => {
    setLoadingFonts(true);
    await Font.loadAsync({
      ...MaterialIcons.font,
      ...AntDesign.font,
      ...Ionicons.font,
      ...Feather.font,
      ...FontAwesome.font,
    });
    setLoadingFonts(false);
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        loadFonts()
      ])
    };
    load();
  }, []);

  useEffect(() => {
    if (loadedTheme) return;
    else if (loadableTheme.state === 'loading' || loadableUseDeviceTheme.state === 'loading') return;
    
    if (loadableUseDeviceTheme.state === 'hasError' && loadableTheme.state === 'hasError') {
      setTheme(themes.sand);
    } else if (loadableUseDeviceTheme.state === 'hasData' && loadableUseDeviceTheme.data) {
      if (colorScheme === 'light') {
        setTheme(themes.light);
      } else if (colorScheme === 'dark') {
        setTheme(themes.dark);
      } else {
        setTheme(themes.sand);
      }
    } else if (loadableTheme.state === 'hasData') {
      setTheme(loadableTheme.data);
    }
    setLoadedTheme(true);

  }, [loadableTheme.state, loadableUseDeviceTheme.state]);

  if (loadableGame.state === 'loading' || loadingFonts || !loadedTheme) {
    return <LoadingScreen />;
  } else if (loadableGame.state === 'hasError') {
    console.log('could not load game state');
    setGame({...initialGame});
    setInitialLoad(false);
  } else if (loadableGame.state === 'hasData' && initialLoad) {
    setInitialLoad(false);
    if (game.has_game_started) {
      setScreen('start options');
    }
  }

  const screenMap: Record<ScreenType, JSX.Element> = {
    'start options': <StartOptions />,
    'game setup': <GameSetup />,
    'game': <Game />,
    'settings': <Settings />,
  }

  return (
    <TouchableWithoutFeedback 
      onPress={Keyboard.dismiss} 
      accessible={false}
    >
      <View style={styles.container}>
        <StatusBar style="auto" />
        {screenMap[screen]}
      </View>
    </TouchableWithoutFeedback>
  );
}

// const styles = StyleSheet.create({
const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.primaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 50,
  },
});
