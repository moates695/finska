import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector } from '@xstate/react';
import { useAtomValue } from 'jotai';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import { themeAtom } from '@/store/theme';
import { Theme } from '@/styles/theme';
import { isGameValid } from '@/store/validation';
import ParticipantForm from '@/components/shared/ParticipantForm';
import ParticipantList from '@/components/shared/ParticipantList';
import Toggle from '@/components/shared/Toggle';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

export default function SetupScreen({ actor }: Props) {
  const theme = useAtomValue(themeAtom);
  const ctx = useSelector(actor, (s) => s.context);
  const [shuffle, setShuffle] = useState(true);

  const canStart = isGameValid(ctx);
  const styles = createStyles(theme);

  const scale = useSharedValue(1);
  useEffect(() => {
    if (canStart) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.18, { duration: 550, easing: Easing.out(Easing.quad) }),
          withTiming(1, { duration: 550, easing: Easing.in(Easing.quad) }),
        ),
        -1,
        false,
      );
    } else {
      cancelAnimation(scale);
      scale.value = withTiming(1, { duration: 150 });
    }
  }, [canStart, scale]);

  const startAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleStart = () => {
    actor.send({ type: 'START_GAME', shuffle });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Setup your game</Text>
        <TouchableOpacity onPress={handleStart} disabled={!canStart}>
          <Animated.Text
            style={[
              {
                color: canStart ? theme.submit : theme.disabledButton,
                fontSize: 16,
                fontWeight: 'bold',
              },
              startAnimatedStyle,
            ]}
          >
            Start
          </Animated.Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listWrapper}>
        <ParticipantList actor={actor} />
      </View>

      <View style={styles.formContainer}>
        <ParticipantForm actor={actor} />
      </View>

      <View style={styles.shuffleRow}>
        <View style={styles.shuffleToggle}>
          <Text style={{ color: theme.text }}>Shuffle order</Text>
          <Toggle value={shuffle} onValueChange={setShuffle} />
        </View>
        <TouchableOpacity onPress={() => actor.send({ type: 'OPEN_SETTINGS' })}>
          <Ionicons
            name="settings-outline"
            size={24}
            color={theme.staticButton}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 20,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 10,
      marginBottom: 10,
    },
    headerText: {
      fontSize: 20,
      fontFamily: 'Fredoka_600SemiBold',
      letterSpacing: 0.3,
      color: theme.text,
    },
    listWrapper: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    formContainer: {
      width: 350,
      backgroundColor: theme.brightComponent,
      borderRadius: 18,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    shuffleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 64,
    },
    shuffleToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  });
