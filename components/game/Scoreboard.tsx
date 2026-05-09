import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { useSelector } from '@xstate/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { Theme } from '@/styles/theme';
import { getMaxScore, getRemainingScore, getParticipantName } from '@/store/game_logic';
import { canWinThisTurn } from '@/store/validation';
import StatusDot from '@/components/shared/StatusDot';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

interface SortedEntry {
  id: string;
  name: string;
  score: number;
  misses: number;
  standing: string;
  is_first_eliminated: boolean;
  last_can_win: boolean;
  in_range: boolean;
}

export default function Scoreboard({ actor }: Props) {
  const theme = useAtomValue(themeAtom);
  const ctx = useSelector(actor, (s) => s.context);
  const [editMode, setEditMode] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState('');

  const styles = createStyles(theme);

  const sortedParticipants = useMemo((): SortedEntry[] => {
    const maxScore = getMaxScore(ctx.rules);

    const sorted = Object.entries(ctx.state).map(([id, data]) => ({
      ...data,
      id,
      name: getParticipantName(ctx, id),
      is_first_eliminated: false,
      last_can_win: false,
      in_range: data.standing === 'playing' && data.score >= ctx.rules.target_score - maxScore,
    }));

    sorted.sort((a, b) => {
      if (a.standing === 'playing' && b.standing !== 'playing') return -1;
      if (a.standing !== 'playing' && b.standing === 'playing') return 1;
      if (a.score === b.score) return a.name.localeCompare(b.name);
      return b.score - a.score;
    });

    // Mark separators
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].in_range && !sorted[i + 1].in_range && sorted[i + 1].standing === 'playing') {
        sorted[i].last_can_win = true;
      }
    }
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].standing !== 'eliminated' && sorted[i].standing === 'eliminated') {
        sorted[i].is_first_eliminated = true;
        break;
      }
    }

    return sorted;
  }, [ctx.state, ctx.rules]);

  const handleEditScore = (id: string, currentScore: number) => {
    setEditingScoreId(id);
    setEditScoreValue(currentScore.toString());
  };

  const submitEditScore = () => {
    if (!editingScoreId) return;
    const num = parseInt(editScoreValue);
    if (!isNaN(num)) {
      actor.send({ type: 'EDIT_SCORE', id: editingScoreId, score: num });
    }
    setEditingScoreId(null);
  };

  const handleCycleStanding = (id: string) => {
    actor.send({ type: 'CYCLE_STANDING', id });
  };

  const handleRemove = (id: string) => {
    actor.send({ type: 'REMOVE_PARTICIPANT_MIDGAME', id });
  };

  return (
    <View style={styles.outer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              setEditMode(!editMode);
              setEditingScoreId(null);
            }}
          >
            <MaterialIcons
              name="edit-note"
              size={24}
              color={theme.staticButton}
            />
          </TouchableOpacity>
          <View style={styles.headerLabels}>
            <Text style={[styles.headerLabel, { width: 45 }]}>score</Text>
            <Text style={[styles.headerLabel, { width: 45 }]}>to win</Text>
            <Text style={[styles.headerLabel, { width: 45 }]}>misses</Text>
            {editMode && <View style={{ width: 24 }} />}
          </View>
        </View>

        {/* Rows */}
        <ScrollView>
          {sortedParticipants.map((data, i) => (
            <React.Fragment key={data.id}>
              {data.is_first_eliminated && <View style={styles.eliminatedSeparator} />}
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: i % 2 ? theme.listColorA : theme.listColorB,
                    borderColor:
                      data.id === ctx.turn_order[0]
                        ? theme.scoreboardCurrentOutline
                        : theme.scoreboardOutline,
                  },
                ]}
              >
                <View style={styles.nameCell}>
                  <StatusDot
                    standing={data.standing as any}
                    editable={editMode}
                    onPress={() => handleCycleStanding(data.id)}
                  />
                  <Text
                    style={{
                      fontSize: 18,
                      color: theme.text,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {data.name}
                  </Text>
                </View>
                <View style={styles.valuesRow}>
                  {/* Score */}
                  {editMode && editingScoreId === data.id ? (
                    <TextInput
                      value={editScoreValue}
                      onChangeText={setEditScoreValue}
                      onBlur={submitEditScore}
                      onSubmitEditing={submitEditScore}
                      autoFocus
                      keyboardType="number-pad"
                      style={[styles.scoreInput, { color: theme.text, borderColor: theme.border }]}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() => editMode && handleEditScore(data.id, data.score)}
                      disabled={!editMode}
                      style={{ width: 45, alignItems: 'center' }}
                    >
                      <Text style={[styles.valueText, { color: theme.text }]}>
                        {data.score}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <Text style={[styles.valueText, { width: 45, color: theme.text }]}>
                    {getRemainingScore(ctx.rules, data.score)}
                  </Text>
                  <Text
                    style={[
                      styles.valueText,
                      {
                        width: 45,
                        color:
                          data.standing === 'eliminated'
                            ? theme.scoreboardEliminatedText
                            : theme.text,
                      },
                    ]}
                  >
                    {data.misses}/{ctx.rules.elimination_count}
                  </Text>
                  {editMode && (
                    <TouchableOpacity onPress={() => handleRemove(data.id)}>
                      <Feather name="delete" size={20} color={theme.staticButton} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {data.last_can_win && <View style={styles.canWinSeparator} />}
            </React.Fragment>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    outer: {
      flex: 1,
      width: '90%',
      marginTop: 20,
      marginBottom: 20,
    },
    container: {
      backgroundColor: theme.paleComponent,
      padding: 12,
      borderRadius: 14,
      paddingBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 30,
    },
    headerLabels: {
      flexDirection: 'row',
      padding: 4,
    },
    headerLabel: {
      textAlign: 'center',
      color: theme.text,
      fontSize: 12,
      letterSpacing: 0.5,
      opacity: 0.7,
      textTransform: 'uppercase',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 42,
      borderRadius: 10,
      padding: 4,
      marginBottom: 6,
      borderWidth: 1.5,
    },
    nameCell: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 8,
      paddingLeft: 5,
    },
    valuesRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    valueText: {
      textAlign: 'center',
      fontSize: 18,
    },
    scoreInput: {
      width: 45,
      textAlign: 'center',
      fontSize: 16,
      borderWidth: 1,
      borderRadius: 4,
      padding: 2,
      height: 30,
    },
    eliminatedSeparator: {
      height: 2,
      backgroundColor: theme.eliminatedSeperator,
      borderRadius: 1,
      marginBottom: 5,
    },
    canWinSeparator: {
      height: 2,
      backgroundColor: theme.canWinSeperator,
      borderRadius: 1,
      marginBottom: 5,
    },
  });
