import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector } from '@xstate/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { Theme } from '@/styles/theme';
import { getParticipantName } from '@/store/game_logic';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

export default function GameEndModal({ actor }: Props) {
  const theme = useAtomValue(themeAtom);
  const ctx = useSelector(actor, (s) => s.context);
  const isWon = useSelector(actor, (s) => s.matches({ playing: 'won' }));
  const isGameOver = useSelector(actor, (s) => s.matches({ playing: 'gameOver' }));

  const styles = createStyles(theme);

  // Find the winner (player with target score, or last playing)
  const winnerName = (() => {
    if (isWon) {
      for (const [id, state] of Object.entries(ctx.state)) {
        if (state.score >= ctx.rules.target_score) {
          return getParticipantName(ctx, id);
        }
      }
    }
    if (isGameOver) {
      for (const [id, state] of Object.entries(ctx.state)) {
        if (state.standing === 'playing') {
          return getParticipantName(ctx, id);
        }
      }
    }
    return '';
  })();

  return (
    <View style={styles.backdrop}>
      <View style={styles.modal}>
        {isWon && (
          <>
            <Text style={styles.title}>We have a winner!</Text>
            <Text style={styles.winner}>{winnerName}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => actor.send({ type: 'CONTINUE' })}
              >
                <Text style={styles.buttonText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => actor.send({ type: 'FINISH' })}
              >
                <Text style={styles.buttonText}>Finish</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {isGameOver && (
          <>
            <Text style={styles.title}>Winner by default!</Text>
            <Text style={styles.winner}>{winnerName}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => actor.send({ type: 'RESET' })}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={() => actor.send({ type: 'FINISH' })}
              >
                <Text style={styles.buttonText}>Finish</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.modalBackdrop,
    },
    modal: {
      backgroundColor: theme.paleComponent,
      borderRadius: 20,
      padding: 32,
      alignItems: 'center',
      gap: 14,
      minWidth: 290,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      fontSize: 16,
      fontFamily: 'Fredoka_600SemiBold',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      opacity: 0.7,
      color: theme.text,
    },
    winner: {
      fontSize: 28,
      fontFamily: 'Fredoka_700Bold',
      letterSpacing: 0.4,
      color: theme.text,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: 20,
      marginTop: 10,
    },
    button: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 24,
    },
    buttonText: {
      color: theme.text,
      fontSize: 16,
    },
  });
