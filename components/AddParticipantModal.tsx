import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, StyleSheet } from "react-native";
import Dropdown, { DropdownOption } from "./Dropdown";
import { generalStyles } from "@/styles/general";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Constants from 'expo-constants';
import { useAtom } from "jotai";
import { Game, gameAtom, isNameInputFocusedAtom, isPlayerAtom, newMemberNameAtom, newMemberNameErrorAtom, newMemberNamesAtom, newNameAtom, newNameErrorAtom, showNewParticipantModalAtom, Team } from "@/store/general";
import Feather from '@expo/vector-icons/Feather';
import * as Crypto from 'expo-crypto';
import { Ionicons } from "@expo/vector-icons";

type ParticipantType = 'player' | 'team';
interface ParticipantOption {
  label: string
  value: ParticipantType
}


// todo allow submit when member name sitting in team input?
export default function AddParticipantModal() {
  const [game, setGame] = useAtom(gameAtom);

  const [isPlayer, setIsPlayer] = useAtom(isPlayerAtom); //? remember last choice? (global state, no load in)
  const [name, setName] = useAtom(newNameAtom);
  const [memberName, setMemberName] = useAtom(newMemberNameAtom);
  const [memberNames, setMemberNames] = useAtom(newMemberNamesAtom);
  const [nameError, setNameError] = useAtom(newNameErrorAtom);
  const [memberNameError, setMemberNameError] = useAtom(newMemberNameErrorAtom);
  const [isNameFocused, setIsNameFocused] = useAtom(isNameInputFocusedAtom);

  const maxNameLength = Constants.expoConfig?.extra?.maxNameLength;

  const handleChangeName = (text: string) => {
    if (isNameTaken(text)) {
      setNameError(`${isPlayer ? 'player' : 'team'} name is already taken`)
    } else if (namesAreSame(text, memberName)) {
      setNameError('team and member names are equal'); 
    } else {
      setNameError(null);
    }
    if (text.length >= maxNameLength) return;
    setName(text);
  }

  const handleChangeMemberName = (text: string) => {
    if (isNameTaken(text)) {
      setMemberNameError('member name is already taken');
    } else if (namesAreSame(name, text)) {
      setNameError('team and member names are equal'); 
    } else {
      setMemberNameError(null);
    }
    if (text.length >= maxNameLength) return;
    setMemberName(text);
  }

  const isNameTaken = (newName: string): boolean => {
    if (newName.trim() === '') return true;
    const existingNames = Object.values(game.players).concat(memberNames);
    for (const team of Object.values(game.teams)) {
      existingNames.push(team.name);
      for (const memberName of Object.values(team.members)) {
        existingNames.push(memberName);
      }
    }
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
      const stateIndex = game.state.length - 1;
      const currentState = {...game.state[stateIndex]};
      currentState.up_next = [...currentState.up_next, id];
      
      setGame({
        ...game,
        players: {
          ...game.players,
          [id]: newName
        },
        state: game.state.map((item, index) => {
          return index === stateIndex ? currentState : item
        })        
      })
    
    } else {
      const team: Team = {
        name: newName,
        members: {}
      }
      
      const members = [...memberNames];
      if (!isNameTaken(memberName) && !namesAreSame(name, memberName)) members.push(memberName.trim());
      if (members.length === 0) return;
      
      const stateIndex = game.state.length - 1;
      const currentState = {...game.state[stateIndex]};
      currentState.up_next = [...currentState.up_next, id];

      for (const name of members) {
        const memberId = Crypto.randomUUID();
        team.members = {
          ...team.members,
          [memberId]: name
        }
        currentState.up_next_members = {
          ...currentState.up_next_members,
          [id]: [...currentState.up_next_members[id], memberId]
        };
      }

      setGame({
        ...game,
        teams: {
          ...game.teams,
          [id]: team
        },
        state: game.state.map((item, index) => {
          return index === stateIndex ? currentState : item
        })
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
    if (isNameTaken(memberName) || namesAreSame(name, memberName)) return true;
    return false;
  };

  return (
    <View
      style={[
        {
          borderRadius: 20,
          position: 'absolute',
          bottom: 10,
          padding: 10,
          width: 350,
          alignItems: 'center',
          backgroundColor: "#e2d298ff",
        },
        !isNameFocused && {
          marginBottom: isPlayer ? 73 : 0,
          bottom: 60,
        }
      ]}
    >
      <View
        style={{
          // marginBottom: 10,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            marginRight: 123,
            borderColor: 'black',
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
            <Text>player</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsPlayer(false)}
            style={[
              styles.box,
              !isPlayer && styles.selectedBox
            ]}
          >
            <Text>team</Text>
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
              borderColor: 'black',
              borderWidth: 1,
              borderRadius: 5,
              width: 250,
              padding: 4,
              height: 40,
              marginRight: 5,
            }}
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
          />
          <TouchableOpacity
            onPress={() => handleAddParticipant()}
            disabled={isSubmitDisabled()}
          >
            <Ionicons
              name="checkmark-circle" 
              size={30} 
              color={isSubmitDisabled() ? "black" : "green"} 
            />
          </TouchableOpacity>
        </View>
        <Text 
          style={{
            color: 'red',
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
          <View>
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
                style={{
                  borderColor: 'black',
                  borderWidth: 1,
                  borderRadius: 5,
                  width: 250,
                  padding: 4,
                  height: 40,
                  marginRight: 5,
                }}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
              <TouchableOpacity
                onPress={() => handleAddMember()}
                disabled={disableAddMember(memberName)}
              >
                <Ionicons 
                  name="add-circle-outline" 
                  size={30} 
                  color="black" 
                />
              </TouchableOpacity>
            </View>
             <Text 
                style={{
                  color: 'red',
                  fontSize: 12,
                  marginLeft: 4,
                  opacity: memberNameError !== '' ? 1 : 0
                }}
              >
                {memberNameError}
              </Text>
          </View>
          {memberNames.length === 0 &&
            <Text>add some team mates!</Text>
          }
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
                    padding: 2
                  }}
                >{name}</Text>
                <Ionicons 
                  name="remove-circle-outline" 
                  size={24} 
                  color="black"
                  onPress={() => handleRemoveMember(i)} 
                  style={{
                    padding: 2
                  }}
                />
              </View>
            )
          })}
        </>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    padding: 6,
    paddingLeft: 10,
    paddingRight: 10,
    width: 80,
    alignItems: 'center',
  },
  selectedBox: {
    backgroundColor: 'white',
    borderRadius: 5,
  }
})