import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSelector } from '@xstate/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { Theme } from '@/styles/theme';
import { isNameTaken } from '@/store/validation';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

export default function ParticipantList({ actor }: Props) {
  const theme = useAtomValue(themeAtom);
  const ctx = useSelector(actor, (s) => s.context);

  const [showEdit, setShowEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editTeamId, setEditTeamId] = useState<string | undefined>(undefined);
  const [editError, setEditError] = useState<string | null>(null);

  const styles = createStyles(theme);

  const startEditing = (id: string, currentName: string, teamId?: string) => {
    setEditingId(id);
    setEditName(currentName);
    setEditTeamId(teamId);
    setEditError(null);
  };

  const handleRename = () => {
    if (!editingId || !editName.trim()) return;
    const trimmed = editName.trim();

    if (isNameTaken(ctx, trimmed, editingId)) {
      setEditError('Name is already taken');
      return;
    }

    actor.send({
      type: 'RENAME',
      id: editingId,
      newName: trimmed,
      teamId: editTeamId,
    });
    setEditingId(null);
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditError(null);
  };

  const removePlayer = (id: string) => {
    actor.send({ type: 'REMOVE_PARTICIPANT', id });
  };

  const removeTeam = (id: string) => {
    actor.send({ type: 'REMOVE_PARTICIPANT', id });
  };

  const removeMember = (teamId: string, memberId: string) => {
    actor.send({ type: 'REMOVE_MEMBER', teamId, memberId });
  };

  const renderName = (id: string, name: string, teamId?: string) => {
    if (showEdit && editingId === id) {
      return (
        <View style={{ flex: 1, gap: 2 }}>
          <TextInput
            value={editName}
            onChangeText={(text) => {
              setEditName(text);
              setEditError(null);
            }}
            onBlur={handleRename}
            onSubmitEditing={handleRename}
            autoFocus
            style={[styles.editInput]}
            returnKeyType="done"
          />
          {editError && <Text style={styles.errorText}>{editError}</Text>}
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => showEdit && startEditing(id, name, teamId)}
        disabled={!showEdit}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
      >
        <Text style={{ color: theme.text }}>{name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flexShrink: 1 }}>
          <Text style={{ color: theme.text }}>Player list</Text>
          {showEdit && <Text style={styles.editHint}>Tap a name to edit</Text>}
        </View>
        <TouchableOpacity
          onPress={() => {
            setShowEdit(!showEdit);
            if (showEdit) cancelEditing();
          }}
          disabled={ctx.turn_order.length === 0}
        >
          <MaterialIcons
            name="edit-note"
            size={24}
            color={showEdit ? theme.submit : theme.staticButton}
            style={{ marginTop: -6, padding: 2 }}
          />
        </TouchableOpacity>
      </View>

      {ctx.turn_order.length === 0 && (
        <Text style={{ textAlign: 'center', color: theme.text }}>
          Add players/teams to get going!
        </Text>
      )}

      <ScrollView
        style={{ flexGrow: 1 }}
        showsVerticalScrollIndicator
        persistentScrollbar
        keyboardShouldPersistTaps="handled"
      >
        {ctx.turn_order.map((id, i) => {
          // Player
          if (id in ctx.players) {
            return (
              <View
                key={id}
                style={[
                  styles.row,
                  {
                    backgroundColor: i % 2 ? 'transparent' : theme.participantListItem,
                    borderRadius: 10,
                    padding: 2,
                    paddingLeft: 10,
                    paddingRight: 10,
                    marginBottom: 5,
                  },
                ]}
              >
                {renderName(id, ctx.players[id])}
                <Feather
                  name="delete"
                  size={24}
                  color={theme.missButton}
                  onPress={() => removePlayer(id)}
                  style={{ opacity: showEdit ? 1 : 0 }}
                  disabled={!showEdit}
                />
              </View>
            );
          }

          // Team
          const team = ctx.teams[id];
          if (!team) return null;

          return (
            <View
              key={id}
              style={{
                backgroundColor: i % 2 ? 'transparent' : theme.participantListItem,
                borderRadius: 10,
                padding: 2,
                paddingLeft: 10,
                paddingRight: 10,
                marginBottom: 5,
              }}
            >
              <View style={styles.row}>
                {renderName(id, team.name)}
                <Feather
                  name="delete"
                  size={24}
                  color={theme.missButton}
                  onPress={() => removeTeam(id)}
                  style={{ opacity: showEdit ? 1 : 0 }}
                  disabled={!showEdit}
                />
              </View>
              <View>
                {(ctx.member_order[id] ?? []).map((memberId) => (
                  <View key={memberId} style={styles.row}>
                    <View style={{ paddingLeft: 20, flex: 1 }}>
                      {renderName(memberId, team.members[memberId], id)}
                    </View>
                    <Ionicons
                      name="remove-circle-outline"
                      size={24}
                      color={theme.removeMemberButton}
                      onPress={() => removeMember(id, memberId)}
                      style={{ marginRight: 30, opacity: showEdit ? 1 : 0 }}
                      disabled={!showEdit}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.brightComponent,
      width: 350,
      flexShrink: 1,
      borderRadius: 18,
      padding: 20,
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    row: {
      flexDirection: 'row',
      width: '100%',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    editInput: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 4,
      padding: 4,
      color: theme.text,
      height: 30,
    },
    errorText: {
      color: theme.errorText,
      fontSize: 11,
    },
    editHint: {
      color: theme.placeHolderText,
      fontSize: 12,
      fontStyle: 'italic',
    },
  });
