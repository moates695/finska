import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSelector } from '@xstate/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { Theme } from '@/styles/theme';
import { validateNewPlayer, validateMemberName, isNameTaken } from '@/store/validation';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

export default function ParticipantForm({ actor }: Props) {
  const theme = useAtomValue(themeAtom);
  const ctx = useSelector(actor, (s) => s.context);

  const [isPlayer, setIsPlayer] = useState(true);
  const [name, setName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [stagedMembers, setStagedMembers] = useState<string[]>([]);

  const styles = createStyles(theme);

  // Validation
  const nameError = useMemo(() => {
    if (!name.trim()) return null;
    if (isNameTaken(ctx, name.trim())) return 'Name is already taken';
    return null;
  }, [name, ctx]);

  const memberNameError = useMemo(() => {
    if (!memberName.trim()) return null;
    return validateMemberName(ctx, memberName, name, stagedMembers);
  }, [memberName, ctx, name, stagedMembers]);

  const canSubmit = useMemo(() => {
    if (!name.trim() || nameError) return false;
    if (!isPlayer) {
      const totalMembers = stagedMembers.length + (memberName.trim() ? 1 : 0);
      return totalMembers >= 2;
    }
    return true;
  }, [name, nameError, isPlayer, stagedMembers, memberName]);

  const canAddMember = useMemo(() => {
    return memberName.trim().length > 0 && !memberNameError;
  }, [memberName, memberNameError]);

  const handleAddMember = () => {
    const trimmed = memberName.trim();
    if (!trimmed || memberNameError) return;
    setStagedMembers((prev) => [...prev, trimmed]);
    setMemberName('');
  };

  const handleRemoveMember = (index: number) => {
    setStagedMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const isSetup = actor.getSnapshot().matches('setup');

    if (isPlayer) {
      if (isSetup) {
        actor.send({ type: 'ADD_PLAYER', name: trimmedName });
      } else {
        actor.send({ type: 'ADD_PARTICIPANT', name: trimmedName, isTeam: false });
      }
    } else {
      // Include the current member input if valid
      const members = [...stagedMembers];
      const lastMember = memberName.trim();
      if (lastMember && !validateMemberName(ctx, lastMember, trimmedName, stagedMembers)) {
        members.push(lastMember);
      }
      if (members.length < 2) return;

      if (isSetup) {
        actor.send({ type: 'ADD_TEAM', name: trimmedName, members });
      } else {
        actor.send({ type: 'ADD_PARTICIPANT', name: trimmedName, isTeam: true, members });
      }
    }

    // Reset form
    setName('');
    setMemberName('');
    setStagedMembers([]);
  };

  const handleSwitchMode = (toPlayer: boolean) => {
    setIsPlayer(toPlayer);
    setMemberName('');
    setStagedMembers([]);
  };

  return (
    <View style={styles.container}>
      {/* Player/Team toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, isPlayer && styles.toggleActive]}
          onPress={() => handleSwitchMode(true)}
        >
          <Text style={[styles.toggleText, isPlayer && styles.toggleTextActive]}>
            Player
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isPlayer && styles.toggleActive]}
          onPress={() => handleSwitchMode(false)}
        >
          <Text style={[styles.toggleText, !isPlayer && styles.toggleTextActive]}>
            Team
          </Text>
        </TouchableOpacity>
      </View>

      {/* Name input */}
      <View style={styles.inputRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={isPlayer ? 'Player name' : 'Team name'}
          placeholderTextColor={theme.placeHolderText}
          style={styles.textInput}
          returnKeyType="done"
        />
        <TouchableOpacity onPress={handleSubmit} disabled={!canSubmit}>
          <Ionicons
            name="checkmark-circle"
            size={32}
            color={canSubmit ? theme.submit : theme.disabledButton}
          />
        </TouchableOpacity>
      </View>
      {nameError && <Text style={styles.errorText}>{nameError}</Text>}

      {/* Team member section */}
      {!isPlayer && (
        <>
          <View style={styles.inputRow}>
            <TextInput
              value={memberName}
              onChangeText={setMemberName}
              placeholder="Member name"
              placeholderTextColor={theme.placeHolderText}
              style={styles.textInput}
              returnKeyType="done"
              onSubmitEditing={handleAddMember}
            />
            <TouchableOpacity onPress={handleAddMember} disabled={!canAddMember}>
              <Ionicons
                name="add-circle"
                size={32}
                color={canAddMember ? theme.submit : theme.disabledButton}
              />
            </TouchableOpacity>
          </View>
          {memberNameError && (
            <Text style={styles.errorText}>{memberNameError}</Text>
          )}

          {/* Staged members list */}
          <ScrollView style={styles.memberList}>
            {stagedMembers.map((m, i) => (
              <View key={i} style={styles.memberRow}>
                <Text style={styles.memberName}>{m}</Text>
                <TouchableOpacity onPress={() => handleRemoveMember(i)}>
                  <Ionicons
                    name="remove-circle-outline"
                    size={22}
                    color={theme.staticButton}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      gap: 8,
    },
    toggleRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 4,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
      backgroundColor: theme.brightComponent,
    },
    toggleActive: {
      backgroundColor: theme.brightComponentSeperate,
    },
    toggleText: {
      color: theme.text,
    },
    toggleTextActive: {
      fontWeight: 'bold',
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    textInput: {
      flex: 1,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      height: 40,
      color: theme.text,
    },
    errorText: {
      color: theme.errorText,
      fontSize: 12,
      marginLeft: 4,
    },
    memberList: {
      maxHeight: 120,
    },
    memberRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    memberName: {
      color: theme.text,
    },
  });
