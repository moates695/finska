import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { Theme } from '@/styles/theme';

interface Props {
  onClose: () => void;
}

const ENTRIES: { title: string; body: string }[] = [
  {
    title: 'Target score',
    body: 'The score players are racing to reach exactly to win the game.',
  },
  {
    title: 'Reset score',
    body: 'If a player exceeds the target score, their score resets to this value.',
  },
  {
    title: 'Eliminate after',
    body: 'A player is eliminated after this many consecutive misses. A successful hit resets the miss count.',
  },
  {
    title: 'Eliminate reset',
    body: 'When an eliminated player rejoins (e.g. after winner continues), their score resets to this value.',
  },
  {
    title: 'Eliminate turns',
    body: 'Number of turns an eliminated player must wait before rejoining. Leave blank to keep them out for the rest of the game.',
  },
  {
    title: 'Skip counts as miss',
    body: 'When enabled, skipping a turn counts toward the consecutive miss count for elimination.',
  },
  {
    title: 'Use pin value',
    body: 'When enabled, knocking down a single pin scores its number; multiple pins score the count. When disabled, score is always the count.',
  },
];

export default function RulesInfoModal({ onClose }: Props) {
  const theme = useAtomValue(themeAtom);
  const styles = createStyles(theme);

  return (
    <View style={styles.backdrop}>
      <View style={styles.modal}>
        <Text style={styles.title}>Game rules</Text>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 4 }}>
          {ENTRIES.map((e) => (
            <View key={e.title} style={styles.entry}>
              <Text style={styles.entryTitle}>{e.title}</Text>
              <Text style={styles.entryBody}>{e.body}</Text>
            </View>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.modalBackdrop,
      zIndex: 10,
    },
    modal: {
      backgroundColor: theme.paleComponent,
      borderRadius: 20,
      padding: 24,
      width: '85%',
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Fredoka_600SemiBold',
      color: theme.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    scroll: {
      marginBottom: 12,
    },
    entry: {
      marginBottom: 12,
    },
    entryTitle: {
      fontSize: 15,
      fontFamily: 'Fredoka_600SemiBold',
      color: theme.text,
      marginBottom: 2,
    },
    entryBody: {
      fontSize: 13,
      color: theme.text,
      lineHeight: 18,
    },
    button: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 24,
      alignSelf: 'center',
    },
    buttonText: {
      color: theme.text,
      fontSize: 16,
    },
  });
