import { StatusBar } from 'expo-status-bar';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { createActor } from 'xstate';
import { useSelector } from '@xstate/react';
import * as Font from 'expo-font';
import { MaterialIcons, AntDesign, Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import {
  Fredoka_400Regular,
  Fredoka_500Medium,
  Fredoka_600SemiBold,
  Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';

import { gameMachine } from './store/machine';
import { themeTypeAtom, themeAtom, useDeviceThemeAtom } from './store/theme';
import { loadState, saveState } from './store/persistence';
import { initialContext, initialRules, GameContext } from './store/types';
import { Theme, themes, ThemeType } from './styles/theme';

import LoadingScreen from './components/shared/LoadingScreen';
import IdleScreen from './components/screens/IdleScreen';
import SetupScreen from './components/screens/SetupScreen';
import PlayScreen from './components/screens/PlayScreen';
import SettingsScreen from './components/screens/SettingsScreen';

// Inject Fredoka as the default font for every Text and TextInput in the app.
// React 19 / Babel may use the new JSX runtime (`jsx`/`jsxs`) instead of
// `React.createElement`, so we patch all three at module load.
{
  const FREDOKA_DEFAULT = { fontFamily: 'Fredoka_500Medium' };
  const inject = (props: any) => ({
    ...(props || {}),
    style: [FREDOKA_DEFAULT, props?.style],
    __fredokaPatched: true,
  });
  const wrap = (mod: any, key: string) => {
    if (!mod || !mod[key] || mod[key].__fredokaPatched) return;
    const original = mod[key];
    const wrapped = function (this: any, type: any, props: any, ...rest: any[]) {
      if ((type === Text || type === TextInput) && !props?.__fredokaPatched) {
        props = inject(props);
      }
      return original.call(this, type, props, ...rest);
    };
    (wrapped as any).__fredokaPatched = true;
    mod[key] = wrapped;
  };
  wrap(React, 'createElement');
  try {
    const jsxRuntime = require('react/jsx-runtime');
    wrap(jsxRuntime, 'jsx');
    wrap(jsxRuntime, 'jsxs');
  } catch {}
  try {
    const jsxDevRuntime = require('react/jsx-dev-runtime');
    wrap(jsxDevRuntime, 'jsxDEV');
  } catch {}
}

// Create and export the actor so components can import it
export let gameActor: ReturnType<typeof createActor<typeof gameMachine>>;

export default function App() {
  const theme = useAtomValue(themeAtom);
  const [themeType, setThemeType] = useAtom(themeTypeAtom);
  const [useDeviceTheme] = useAtom(useDeviceThemeAtom);
  const colorScheme = useColorScheme();

  const [ready, setReady] = useState(false);
  const actorRef = useRef<typeof gameActor | null>(null);

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e: KeyboardEvent) =>
      setKeyboardHeight(e.endCoordinates.height + 10),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Migrate any stored theme type that no longer exists
  useEffect(() => {
    if (!themes[themeType]) setThemeType('light');
  }, [themeType]);

  // Apply device theme if enabled
  useEffect(() => {
    if (!useDeviceTheme || !colorScheme) return;
    const deviceTheme: ThemeType = colorScheme === 'dark' ? 'dark' : 'light';
    setThemeType(deviceTheme);
  }, [useDeviceTheme, colorScheme]);

  // Initialise: load fonts, restore saved game state, create actor
  useEffect(() => {
    const init = async () => {
      // Load fonts
      await Font.loadAsync({
        ...MaterialIcons.font,
        ...AntDesign.font,
        ...Ionicons.font,
        ...Feather.font,
        ...FontAwesome.font,
        Fredoka_400Regular,
        Fredoka_500Medium,
        Fredoka_600SemiBold,
        Fredoka_700Bold,
      });


      // Load saved state and create actor
      const saved = await loadState();
      let actor: typeof gameActor;

      if (saved?.context && saved.context.has_started) {
        // Restore to idle with saved context so user can choose to continue
        actor = createActor(gameMachine, {
          snapshot: gameMachine.resolveState({
            value: 'idle',
            context: {
              ...initialContext,
              ...saved.context,
              rules: { ...initialRules, ...saved.context.rules },
            },
          }),
        });
      } else {
        actor = createActor(gameMachine);
      }

      actor.start();

      // Persist state on every transition
      actor.subscribe((snapshot) => {
        const ctx = snapshot.context;
        if (ctx.has_started) {
          saveState(ctx, snapshot.value);
        }
      });

      gameActor = actor;
      actorRef.current = actor;
      setReady(true);
    };

    init();
  }, []);

  const styles = createStyles(theme);

  if (!ready || !actorRef.current) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={[]}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={300}
            style={{ flex: 1, width: '100%' }}
            contentContainerStyle={styles.container}
          >
            <StatusBar
              style={theme.type === 'dark' ? 'light' : 'dark'}
              backgroundColor={theme.primaryBackground}
            />
            <ScreenRouter actor={actorRef.current} />
            <View style={{ height: keyboardHeight }} />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function ScreenRouter({ actor }: { actor: typeof gameActor }) {
  const isIdle = useSelector(actor, (s) => s.matches('idle'));
  const isSetup = useSelector(actor, (s) => s.matches('setup'));
  const isPlaying = useSelector(actor, (s) => s.matches('playing'));
  const isSettings = useSelector(actor, (s) => s.matches('settings'));

  if (isIdle) return <IdleScreen actor={actor} />;
  if (isSetup) return <SetupScreen actor={actor} />;
  if (isPlaying) return <PlayScreen actor={actor} />;
  if (isSettings) return <SettingsScreen actor={actor} />;

  return <LoadingScreen />;
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryBackground,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      paddingTop: 50,
      paddingBottom: 20,
    },
  });
