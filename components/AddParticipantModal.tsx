import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet, Switch, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import Dropdown, { DropdownOption } from "./Dropdown";
import { generalStyles } from "@/styles/general";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Constants from 'expo-constants';
import { useAtom, useAtomValue } from "jotai";
import { Game, gameAtom, initialParticipantState, isNameInputFocusedAtom, isPlayerAtom, newMemberNameAtom, newMemberNameErrorAtom, newMemberNamesAtom, newNameAtom, newNameErrorAtom, screenAtom, showNewParticipantModalAtom, Team, themeAtom } from "@/store/general";
import Feather from '@expo/vector-icons/Feather';
import * as Crypto from 'expo-crypto';
import { Ionicons } from "@expo/vector-icons";
import { Theme } from "@/styles/theme";

type ParticipantType = 'player' | 'team';
interface ParticipantOption {
  label: string
  value: ParticipantType
}

export default function AddParticipantModal() {
  const [game, setGame] = useAtom(gameAtom);
  const theme = useAtomValue(themeAtom);
  const screen = useAtomValue(screenAtom);
  
  const [isPlayer, setIsPlayer] = useAtom(isPlayerAtom); //? remember last choice? (global state, no load in)
  const [name, setName] = useAtom(newNameAtom);
  const [memberName, setMemberName] = useAtom(newMemberNameAtom);
  const [memberNames, setMemberNames] = useAtom(newMemberNamesAtom);
  const [nameError, setNameError] = useAtom(newNameErrorAtom);
  const [memberNameError, setMemberNameError] = useAtom(newMemberNameErrorAtom);
  // const [isNameFocused, setIsNameFocused] = useAtom(isNameInputFocusedAtom);

  const styles = createStyles(theme);

  const existingNames = useMemo(() => {
    const names = Object.values(game.players).concat(memberNames);
    for (const team of Object.values(game.teams)) {
      names.push(team.name);
      for (const memberName of Object.values(team.members)) {
        names.push(memberName);
      }
    }
    return names;
  }, [game, memberNames]);

  const maxNameLength = Constants.expoConfig?.extra?.maxNameLength;

  const handleChangeName = (text: string) => {
    if (text.trim() === '') {
      setNameError('name is empty');
    } else if (isNameTaken(text)) {
      setNameError('name is already taken')
    } else if (namesAreSame(text, memberName)) {
      setNameError('team and member names are equal'); 
    } else {
      setNameError(null);
    }
    if (text.length >= maxNameLength) {
      setNameError('name is too long');
      return;
    }
    setName(text);
  }

  const handleChangeMemberName = (text: string) => {
    if (text.trim() === '') {
      setMemberNameError('name is empty');
    } else if (isNameTaken(text)) {
      setMemberNameError('name is already taken');
    } else if (namesAreSame(name, text)) {
      setNameError('team and member names are equal'); 
    } else {
      setMemberNameError(null);
    }
    if (text.length >= maxNameLength) {
      setNameError('name is too long');
      return;
    }
    setMemberName(text);
  }

  const isNameTaken = (newName: string): boolean => {
    if (newName.trim() === '') return true;
    return existingNames.some((tempName) => { return tempName.trim().toLowerCase() === newName.trim().toLowerCase()});
  }

  const namesAreSame = (name1: string, name2: string): boolean => {
    if (isPlayer) return false;
    return name1.trim().toLowerCase() === name2.trim().toLowerCase();
  };

  const handleAddMember = () => {
    const newMember = memberName.trim();
    if (isNameTaken(newMember) || namesAreSame(newMember, name)) return;

    setMemberNames((prev) => [...prev, newMember]);
    setMemberName('');
  };

  const handleRemoveMember = (index: number) => {
    setMemberNames(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddParticipant = () => {
    const newName = name.trim();
    if (isNameTaken(newName)) return;

    const id = Crypto.randomUUID();
    if (isPlayer) {
      setGame({
        ...game,
        players: {
          ...game.players,
          [id]: newName
        },
        state: {
          ...game.state,
          [id]: {...initialParticipantState}
        },
        up_next: [...game.up_next, id]
      })
    } else {
      const tempMembers = [...memberNames];
      if (!isNameTaken(memberName) && !namesAreSame(name, memberName)) {
        tempMembers.push(memberName.trim());
      }
      if (tempMembers.length === 0) return;

      const members = Object.fromEntries(
        tempMembers.map((name) => [ Crypto.randomUUID(), name])
      )

      const team: Team = {
        name: newName,
        members
      }

      const up_next_members = Object.keys(members);

      setGame({
        ...game,
        teams: {
          ...game.teams,
          [id]: team
        },
        state: {
          ...game.state,
          [id]: {...initialParticipantState}
        },
        up_next: [...game.up_next, id],
        up_next_members: {
          ...game.up_next_members,
          [id]: up_next_members
        }
      })

      setMemberNames([]);
      setMemberName('');
    }

    setName('');
  };

  const disableAddMember = (input: string): boolean => {
    if (isNameTaken(input) || namesAreSame(name, memberName)) return true;
    return false;
  };

  const isSubmitDisabled = (): boolean => {
    if (name.trim() === '') return true;
    if (isPlayer) return false;
    if (memberName.trim() === '' && memberNames.length === 0) return true;
    if (memberName.trim() !== '' && (isNameTaken(memberName) || namesAreSame(name, memberName))) return true;
    return false;
  };

  useEffect(() => {
    let isNameError = false;
    let isMemberNameError = false;
    for (const existing of existingNames) {
      if (existing === name) isNameError = true;
      if (existing === memberName) isMemberNameError = true;
      if (isNameError && isMemberNameError) break;
    }
    setNameError(isNameError ? 'name is already taken' : null);
    setMemberNameError(isMemberNameError ? 'name is already taken' : null);
  }, [existingNames]);

  return (
    <View
      style={[
        {
          borderRadius: 20,
          padding: 10,
          width: 350,
          alignItems: 'center',
          backgroundColor: theme.paleComponent,
        }
      ]}
    >
      <View>
        <View
          style={{
            flexDirection: 'row',
            marginRight: 123,
            borderColor: theme.border,
            borderRadius: 5,
            borderWidth: 1,
            marginBottom: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => setIsPlayer(true)}
            style={[
              styles.box,
              isPlayer && styles.selectedBox
            ]}
          >
            <Text
              style={{
                color: !isPlayer ? theme.text : ''   
              }}
            >
              player
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsPlayer(false)}
            style={[
              styles.box,
              !isPlayer && styles.selectedBox
            ]}
          >
            <Text
              style={{
                color: isPlayer ? theme.text : ''   
              }}
            >
              team
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <TextInput 
            value={name}
            onChangeText={(text) => handleChangeName(text)}
            returnKeyType="done"
            placeholder={`${isPlayer ? 'player': 'team'} name`} //? remove if still laggy
            style={{
              borderColor: theme.border,
              borderWidth: 1,
              borderRadius: 5,
              width: 250,
              padding: 4,
              height: 40,
              marginRight: 5,
              textAlign: 'center',
              color: theme.text,
            }}
            placeholderTextColor={theme.placeHolderText}
          />
          <TouchableOpacity
            onPress={() => handleAddParticipant()}
            disabled={isSubmitDisabled()}
          >
            <Ionicons
              name="checkmark-circle" 
              size={30}  
              color={isSubmitDisabled() ? theme.disabledButton : theme.submit} 
            />
          </TouchableOpacity>
        </View>
        <Text 
          style={{
            color: theme.errorText,
            fontSize: 12,
            marginLeft: 4,
            opacity: nameError !== '' ? 1 : 0
          }}
        >
          {nameError}
        </Text>
      </View>
      {!isPlayer &&
        <>
          <View pointerEvents="box-none">
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TextInput
                value={memberName}
                onChangeText={(text) => handleChangeMemberName(text)}
                returnKeyType="done"
                placeholder="member name" 
                placeholderTextColor={theme.placeHolderText}
                style={{
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 5,
                  width: 250,
                  padding: 4,
                  height: 40,
                  marginRight: 5,
                  textAlign: 'center',
                  color: theme.text,
                }}
              />
              <TouchableOpacity
                onPress={() => handleAddMember()}
                disabled={disableAddMember(memberName)}
              >
                <Ionicons 
                  name="add-circle-outline" 
                  size={30} 
                  color={disableAddMember(memberName) ? theme.staticButton : theme.submit}
                />
              </TouchableOpacity>
            </View>
             <Text 
                style={{
                  color: theme.missButton,
                  fontSize: 12,
                  marginLeft: 4,
                  opacity: memberNameError !== '' ? 1 : 0
                }}
              >
                {memberNameError}
              </Text>
          </View>
          <ScrollView
            style={[screen !== 'game' && {maxHeight: 130}]}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={true}
          >
            {memberNames.map((name, i) => {
              return (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: 280,
                    paddingRight: 30,
                  }}
                >
                  <Text
                    style={{
                      padding: 2,
                      color: theme.text
                    }}
                  >
                    {name}
                  </Text>
                  <Ionicons 
                    name="remove-circle-outline" 
                    size={24} 
                    color={theme.staticButton}
                    onPress={() => handleRemoveMember(i)} 
                    style={{
                      padding: 2
                    }}
                  />
                </View>
              )
            })}
          </ScrollView>
        </>
      }
    </View>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({
  box: {
    padding: 6,
    paddingLeft: 10,
    paddingRight: 10,
    width: 80,
    alignItems: 'center',
  },
  selectedBox: {
    backgroundColor: theme.selectedBox,
    borderRadius: 5,
  }
})