import React, { useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector } from '@xstate/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { Theme } from '@/styles/theme';
import {
  getMaxScore,
  getRemainingScore,
  getParticipantName,
  editScore as applyEditScore,
  editMisses as applyEditMisses,
  cycleStanding as applyCycleStanding,
  renameParticipant as applyRename,
  removeParticipant as applyRemoveParticipant,
  removeMember as applyRemoveMember,
  addMember as applyAddMember,
} from '@/store/game_logic';
import { isNameTaken, validateMemberName } from '@/store/validation';
import StatusDot from '@/components/shared/StatusDot';
import type { GameContext } from '@/store/types';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

type PendingEvent =
  | { type: 'EDIT_SCORE'; id: string; score: number }
  | { type: 'EDIT_MISSES'; id: string; misses: number }
  | { type: 'RENAME'; id: string; newName: string; teamId?: string }
  | { type: 'CYCLE_STANDING'; id: string }
  | { type: 'REMOVE_PARTICIPANT_MIDGAME'; id: string }
  | { type: 'REMOVE_MEMBER'; teamId: string; memberId: string }
  | { type: 'ADD_MEMBER'; teamId: string; name: string };

function applyPendingEvent(ctx: GameContext, event: PendingEvent): GameContext {
  switch (event.type) {
    case 'EDIT_SCORE':
      return { ...ctx, ...applyEditScore(ctx, event.id, event.score).updates };
    case 'EDIT_MISSES':
      return { ...ctx, ...applyEditMisses(ctx, event.id, event.misses).updates };
    case 'RENAME':
      return { ...ctx, ...applyRename(ctx, event.id, event.newName, event.teamId) };
    case 'CYCLE_STANDING':
      return { ...ctx, ...applyCycleStanding(ctx, event.id).updates };
    case 'REMOVE_PARTICIPANT_MIDGAME':
      return { ...ctx, ...applyRemoveParticipant(ctx, event.id) };
    case 'REMOVE_MEMBER':
      return { ...ctx, ...applyRemoveMember(ctx, event.teamId, event.memberId) };
    case 'ADD_MEMBER':
      return { ...ctx, ...applyAddMember(ctx, event.teamId, event.name) };
  }
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
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState('');
  const [editingMissesId, setEditingMissesId] = useState<string | null>(null);
  const [editMissesValue, setEditMissesValue] = useState('');
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameTeamId, setEditNameTeamId] = useState<string | undefined>(undefined);
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const [addingMemberTeamId, setAddingMemberTeamId] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState('');

  const viewCtx = useMemo(
    () => pendingEvents.reduce(applyPendingEvent, ctx),
    [ctx, pendingEvents],
  );

  // Latest pendingEvents, readable from a deferred callback (see saveEditMode).
  const pendingRef = useRef(pendingEvents);
  pendingRef.current = pendingEvents;

  const addMemberError = useMemo(() => {
    if (!addingMemberTeamId) return null;
    if (!newMemberName.trim()) return null;
    const team = viewCtx.teams[addingMemberTeamId];
    if (!team) return null;
    const existing = (viewCtx.member_order[addingMemberTeamId] ?? []).map(
      (mid) => team.members[mid],
    );
    return validateMemberName(viewCtx, newMemberName, team.name, existing);
  }, [addingMemberTeamId, newMemberName, viewCtx]);

  const styles = createStyles(theme);

  const sortedParticipants = useMemo((): SortedEntry[] => {
    const maxScore = getMaxScore(viewCtx.rules);

    // Order is sorted from `ctx` while editing (frozen — ctx doesn't change until Save)
    // and from `viewCtx` otherwise. Values always come from viewCtx.
    const orderCtx = editMode ? ctx : viewCtx;
    const orderedIds = Object.keys(orderCtx.state)
      .filter((id) => id in viewCtx.state)
      .sort((a, b) => {
        const sa = orderCtx.state[a];
        const sb = orderCtx.state[b];
        if (sa.standing === 'playing' && sb.standing !== 'playing') return -1;
        if (sa.standing !== 'playing' && sb.standing === 'playing') return 1;
        if (sa.score === sb.score) {
          return getParticipantName(orderCtx, a).localeCompare(getParticipantName(orderCtx, b));
        }
        return sb.score - sa.score;
      });

    const sorted = orderedIds.map((id) => {
      const data = viewCtx.state[id];
      return {
        ...data,
        id,
        name: getParticipantName(viewCtx, id),
        is_first_eliminated: false,
        last_can_win: false,
        in_range: data.standing === 'playing' && data.score >= viewCtx.rules.target_score - maxScore,
      };
    });

    // Separators are only shown outside edit mode.
    if (editMode) return sorted;

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
  }, [ctx, viewCtx, editMode]);

  const queueEvent = (event: PendingEvent) => {
    setPendingEvents((prev) => [...prev, event]);
  };

  const handleEditScore = (id: string, currentScore: number) => {
    setEditingScoreId(id);
    setEditScoreValue(currentScore.toString());
  };

  const submitEditScore = () => {
    if (!editingScoreId) return;
    const id = editingScoreId;
    const num = parseInt(editScoreValue);
    setEditingScoreId(null);
    if (isNaN(num)) return;

    const { target_score, reset_score } = viewCtx.rules;

    // Winning score: auto-flush so the machine transitions to 'won' immediately.
    if (num === target_score) {
      flushAndExit([{ type: 'EDIT_SCORE', id, score: num }]);
      return;
    }

    let final = num;
    if (num > target_score) final = reset_score;
    else if (num < 0) final = 0;

    if (final !== viewCtx.state[id]?.score) {
      queueEvent({ type: 'EDIT_SCORE', id, score: final });
    }
  };

  const handleEditMisses = (id: string, currentMisses: number) => {
    setEditingMissesId(id);
    setEditMissesValue(currentMisses.toString());
  };

  const submitEditMisses = () => {
    if (!editingMissesId) return;
    const id = editingMissesId;
    const num = parseInt(editMissesValue);
    setEditingMissesId(null);
    if (isNaN(num)) return;

    const clamped = Math.max(0, Math.min(num, viewCtx.rules.elimination_count));
    if (clamped !== viewCtx.state[id]?.misses) {
      queueEvent({ type: 'EDIT_MISSES', id, misses: clamped });
    }
  };

  const startEditingName = (id: string, currentName: string, teamId?: string) => {
    setEditingNameId(id);
    setEditName(currentName);
    setEditNameTeamId(teamId);
    setEditNameError(null);
  };

  const cancelEditingName = () => {
    setEditingNameId(null);
    setEditNameError(null);
  };

  const submitRename = () => {
    if (!editingNameId || !editName.trim()) {
      cancelEditingName();
      return;
    }
    const trimmed = editName.trim();
    if (isNameTaken(viewCtx, trimmed, editingNameId)) {
      setEditNameError('Name is already taken');
      return;
    }
    queueEvent({
      type: 'RENAME',
      id: editingNameId,
      newName: trimmed,
      teamId: editNameTeamId,
    });
    cancelEditingName();
  };

  const handleCycleStanding = (id: string) => {
    queueEvent({ type: 'CYCLE_STANDING', id });
  };

  const handleRemove = (id: string) => {
    queueEvent({ type: 'REMOVE_PARTICIPANT_MIDGAME', id });
  };

  const handleRemoveMember = (teamId: string, memberId: string) => {
    queueEvent({ type: 'REMOVE_MEMBER', teamId, memberId });
  };

  const startAddingMember = (teamId: string) => {
    setAddingMemberTeamId(teamId);
    setNewMemberName('');
  };

  const cancelAddingMember = () => {
    setAddingMemberTeamId(null);
    setNewMemberName('');
  };

  const submitAddMember = () => {
    if (!addingMemberTeamId) return;
    const trimmed = newMemberName.trim();
    if (!trimmed) {
      cancelAddingMember();
      return;
    }
    if (addMemberError) return;
    queueEvent({ type: 'ADD_MEMBER', teamId: addingMemberTeamId, name: trimmed });
    cancelAddingMember();
  };

  const enterEditMode = () => {
    setEditMode(true);
    setPendingEvents([]);
  };

  const clearTransientEdits = () => {
    setEditingScoreId(null);
    setEditingMissesId(null);
    cancelEditingName();
    cancelAddingMember();
  };

  const cancelEditMode = () => {
    clearTransientEdits();
    setPendingEvents([]);
    setEditMode(false);
  };

  const flushAndExit = (extra: PendingEvent[] = []) => {
    clearTransientEdits();
    // Defer so any blur-triggered queueEvent from an open TextInput commits first.
    setTimeout(() => {
      [...pendingRef.current, ...extra].forEach((e) => actor.send(e));
      setPendingEvents([]);
      setEditMode(false);
    }, 0);
  };

  const saveEditMode = () => flushAndExit();

  const renderEditableName = (
    id: string,
    name: string,
    teamId: string | undefined,
    textStyle: { fontSize: number },
  ) => {
    if (editMode && editingNameId === id) {
      return (
        <View style={{ flex: 1, gap: 2 }}>
          <TextInput
            value={editName}
            onChangeText={(text) => {
              setEditName(text);
              setEditNameError(null);
            }}
            onBlur={submitRename}
            onSubmitEditing={submitRename}
            autoFocus
            returnKeyType="done"
            style={[styles.nameInput, { color: theme.text, borderColor: theme.border }]}
          />
          {editNameError && <Text style={styles.errorText}>{editNameError}</Text>}
        </View>
      );
    }
    return (
      <TouchableOpacity
        onPress={() => editMode && startEditingName(id, name, teamId)}
        disabled={!editMode}
        style={{ flex: 1 }}
      >
        <Text
          style={{ fontSize: textStyle.fontSize, color: theme.text }}
          numberOfLines={1}
        >
          {name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.outer}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={enterEditMode}
              disabled={editMode}
              style={{ marginTop: -10 }}
            >
              <MaterialIcons
                name="edit-note"
                size={24}
                color={editMode ? theme.submit : theme.staticButton}
              />
            </TouchableOpacity>
            {editMode && (
              <View style={styles.editActions}>
                <TouchableOpacity
                  onPress={cancelEditMode}
                  style={[styles.editActionButton, { borderColor: theme.missButton }]}
                >
                  <Text style={[styles.editActionText, { color: theme.missButton }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={saveEditMode}
                  disabled={pendingEvents.length === 0}
                  style={[
                    styles.editActionButton,
                    {
                      borderColor:
                        pendingEvents.length === 0
                          ? theme.disabledButton
                          : theme.submit,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.editActionText,
                      {
                        color:
                          pendingEvents.length === 0
                            ? theme.disabledButton
                            : theme.submit,
                      },
                    ]}
                  >
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.headerLabels}>
            <Text style={[styles.headerLabel, { width: 45 }]}>score</Text>
            <Text style={[styles.headerLabel, { width: 45 }]}>to win</Text>
            <Text style={[styles.headerLabel, { width: 45 }]}>misses</Text>
            {editMode && <View style={{ width: 24 }} />}
          </View>
        </View>

        {/* Rows */}
        <ScrollView keyboardShouldPersistTaps="handled">
          {sortedParticipants.map((data, i) => {
            const isTeam = data.id in viewCtx.teams;
            const memberIds = isTeam ? (viewCtx.member_order[data.id] ?? []) : [];

            return (
              <React.Fragment key={data.id}>
                {data.is_first_eliminated && <View style={styles.eliminatedSeparator} />}
                <View
                  style={[
                    styles.row,
                    {
                      backgroundColor: i % 2 ? theme.listColorA : theme.listColorB,
                      borderColor:
                        !editMode && data.id === viewCtx.turn_order[0]
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
                    {renderEditableName(data.id, data.name, undefined, { fontSize: 18 })}
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
                        style={[styles.numericInput, { color: theme.text, borderColor: theme.border }]}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => editMode && handleEditScore(data.id, data.score)}
                        disabled={!editMode}
                        style={[
                          styles.editableValueCell,
                          editMode && { borderColor: theme.border, borderBottomWidth: 1 },
                        ]}
                      >
                        <Text style={[styles.valueText, { color: theme.text }]}>
                          {data.score}
                        </Text>
                      </TouchableOpacity>
                    )}

                    <Text style={[styles.valueText, { width: 45, color: theme.text }]}>
                      {getRemainingScore(viewCtx.rules, data.score)}
                    </Text>

                    {/* Misses */}
                    {editMode && editingMissesId === data.id ? (
                      <TextInput
                        value={editMissesValue}
                        onChangeText={setEditMissesValue}
                        onBlur={submitEditMisses}
                        onSubmitEditing={submitEditMisses}
                        autoFocus
                        keyboardType="number-pad"
                        style={[styles.numericInput, { color: theme.text, borderColor: theme.border }]}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => editMode && handleEditMisses(data.id, data.misses)}
                        disabled={!editMode}
                        style={[
                          styles.editableValueCell,
                          editMode && { borderColor: theme.border, borderBottomWidth: 1 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.valueText,
                            {
                              color:
                                data.standing === 'eliminated'
                                  ? theme.scoreboardEliminatedText
                                  : theme.text,
                            },
                          ]}
                        >
                          {data.misses}/{viewCtx.rules.elimination_count}
                        </Text>
                      </TouchableOpacity>
                    )}
                    {editMode && (
                      <TouchableOpacity onPress={() => handleRemove(data.id)}>
                        <Feather name="delete" size={22} color={theme.missButton} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Team members (visible in edit mode) */}
                {editMode && isTeam && memberIds.map((memberId) => {
                  const memberName = viewCtx.teams[data.id].members[memberId];
                  return (
                    <View key={memberId} style={styles.memberRow}>
                      <View style={styles.memberNameCell}>
                        {renderEditableName(memberId, memberName, data.id, { fontSize: 16 })}
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveMember(data.id, memberId)}>
                        <Ionicons
                          name="remove-circle-outline"
                          size={22}
                          color={theme.removeMemberButton}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {/* Add member row (edit mode + team) */}
                {editMode && isTeam && (
                  <View style={styles.addMemberRow}>
                    {addingMemberTeamId === data.id ? (
                      <View style={styles.memberNameCell}>
                        <TextInput
                          value={newMemberName}
                          onChangeText={setNewMemberName}
                          onBlur={submitAddMember}
                          onSubmitEditing={submitAddMember}
                          autoFocus
                          returnKeyType="done"
                          placeholder="New member name"
                          placeholderTextColor={theme.placeHolderText}
                          style={[styles.nameInput, { color: theme.text, borderColor: theme.border }]}
                        />
                        {addMemberError && <Text style={styles.errorText}>{addMemberError}</Text>}
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => startAddingMember(data.id)}
                        style={styles.addMemberButton}
                      >
                        <Ionicons name="add-circle-outline" size={16} color={theme.submit} />
                        <Text style={[styles.addMemberText, { color: theme.submit }]}>
                          Add member
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {data.last_can_win && <View style={styles.canWinSeparator} />}
              </React.Fragment>
            );
          })}
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
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    editActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: -10,
    },
    editActionButton: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 3,
    },
    editActionText: {
      fontSize: 13,
      fontWeight: '600',
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
    numericInput: {
      width: 45,
      textAlign: 'center',
      fontSize: 16,
      borderWidth: 1,
      borderRadius: 4,
      padding: 2,
      height: 30,
    },
    editableValueCell: {
      width: 45,
      alignItems: 'center',
    },
    nameInput: {
      borderWidth: 1,
      borderRadius: 4,
      padding: 4,
      height: 30,
      fontSize: 16,
    },
    errorText: {
      color: theme.errorText,
      fontSize: 11,
    },
    memberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 30,
      paddingRight: 4,
      marginTop: -2,
      marginBottom: 6,
    },
    memberNameCell: {
      flex: 1,
    },
    addMemberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 30,
      paddingRight: 4,
      marginTop: -4,
      marginBottom: 6,
    },
    addMemberButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    addMemberText: {
      fontSize: 12,
      fontStyle: 'italic',
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
