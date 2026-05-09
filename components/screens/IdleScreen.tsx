import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from '@xstate/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { Theme } from '@/styles/theme';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

export default function IdleScreen({ actor }: Props) {
  const theme = useAtomValue(themeAtom);
  const ctx = useSelector(actor, (s) => s.context);
  const hasSavedGame = ctx.has_started && ctx.turn_order.length >= 2;

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finska</Text>

      {hasSavedGame && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => actor.send({ type: 'CONTINUE_GAME' })}
        >
          <Text style={styles.buttonText}>Continue Game</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => actor.send({ type: 'NEW_GAME' })}
      >
        <Text style={styles.buttonText}>New Game</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 20,
    },
    title: {
      fontSize: 52,
      fontFamily: 'Fredoka_700Bold',
      letterSpacing: 2,
      color: theme.text,
      marginBottom: 48,
    },
    button: {
      backgroundColor: theme.brightComponent,
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 14,
      minWidth: 220,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    buttonText: {
      fontSize: 17,
      fontFamily: 'Fredoka_600SemiBold',
      letterSpacing: 0.3,
      color: theme.text,
    },
  });
