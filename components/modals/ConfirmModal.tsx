import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { Theme } from '@/styles/theme';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

export default function ConfirmModal({ actor }: Props) {
  const theme = useAtomValue(themeAtom);
  const styles = createStyles(theme);

  return (
    <View style={styles.backdrop}>
      <View style={styles.modal}>
        <Text style={styles.title}>Finish this game?</Text>
        <Text style={styles.subtitle}>This will end the current game.</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => actor.send({ type: 'CANCEL' })}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => actor.send({ type: 'CONFIRM' })}
          >
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        </View>
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
      padding: 30,
      alignItems: 'center',
      gap: 12,
      minWidth: 280,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    subtitle: {
      fontSize: 14,
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
