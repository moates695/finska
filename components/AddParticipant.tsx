import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import Dropdown, { DropdownOption } from "./Dropdown";
import { generalStyles } from "@/styles/general";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Constants from 'expo-constants';
import { useAtom } from "jotai";
import { Game, gameAtom, Team } from "@/store/general";
import Feather from '@expo/vector-icons/Feather';
import * as Crypto from 'expo-crypto';

type ParticipantType = 'player' | 'team';
interface ParticipantOption {
  label: string
  value: ParticipantType
}

export default function AddParticipant() {
  const [game, setGame] = useAtom(gameAtom);

  const [isPlayer, setIsPlayer] = useState<boolean>(true); //? remember last choice? (global state, no load in)
  const [name, setName] = useState<string>('');
  const [memberName, setMemberName] = useState<string>('');
  const [memberNames, setMemberNames] = useState<string[]>([]);

  // const [nameFocus, setNameFocus] = useState<boolean>(false);
  // const [amemberNameFocus, setMemberNameFocus] = useState<boolean>(false);

  // todo check for name collisions before submitting new player / team
  // todo: add players to teams

  const participantOptions: ParticipantOption[] = [
    { label: 'player', value: 'player' },
    { label: 'team', value: 'team' },
  ]
  const [participantValue, setParticipantValue] = useState<ParticipantType>('player');

  const maxNameLength = Constants.expoConfig?.extra?.maxNameLength;

  const handleChooseParticipant = (value: ParticipantType) => {
    setParticipantValue(value);
    setIsPlayer(value === 'player');
  };

  const handleChangeName = (text: string) => {
    if (text.length >= maxNameLength) return;
    setName(text);
  }

  const handleChangeMemberName = (text: string) => {
    if (text.length >= maxNameLength) return;
    setMemberName(text);
  }

  // todo show name collisions on screen? (error message / popup)
  const isNameTaken = (newName: string): boolean => {
    const existingNames = Object.values(game.players);
    for (const team of Object.values(game.teams)) {
      existingNames.push(team.name);
      for (const memberName of Object.values(team.members)) {
        existingNames.push(memberName);
      }
    }
    return existingNames.some((name) => { return name.trim().toLowerCase() === newName.trim().toLowerCase()});
  }

  const handleAddMember = () => {
    const newMember = memberName.trim();
    if (newMember === '' || isNameTaken(newMember)) return;

    setMemberNames((prev) => [...prev, newMember]);
    setMemberName('');
  };

  const handleRemoveMember = (index: number) => {
    setMemberNames(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddParticipant = () => {
    const newName = name.trim();
    if (newName === '' || isNameTaken(newName)) return;

    const id = Crypto.randomUUID();
    if (isPlayer) {
      setGame((prev) => {
        const game = prev as Awaited<Game>;
        return {
          ...game,
          players: {
            ...game.players,
            [id]: newName
          },
          up_next: [...game.up_next, id]
        };
      });

    } else {
      const team: Team = {
        name: newName,
        members: {}
      }
      const upNextMembers: string[] = [];
      for (const name of memberNames) {
        const memberId = Crypto.randomUUID();
        team.members = {
          ...team.members,
          [memberId]: name
        }
        upNextMembers.push(memberId);
      }

      setGame((prev) => {
        const game = prev as Awaited<Game>;
        return {
          ...game,
          teams: {
            ...game.teams,
            [id]: team,
          },
          up_next_members: {
            ...game.up_next_members,
            [id]: upNextMembers
          }
        };
      });

      setMemberNames([]);
    }
    setName('');
  };

  const isSubmitDisabled = (): boolean => {
    if (name.trim() === '') return true;
    if (!isPlayer && memberNames.length === 0) return true;
    return false;
  };

  console.log(game);

  return (
    <View
      style={{
      }}
    >
      <Dropdown 
        options={participantOptions}
        selectedValue={participantValue}
        setSelectedValue={handleChooseParticipant}
      />
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
          textAlign: 'center'
        }}
      />
      {!isPlayer &&
        <>
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
              textAlign: 'center'
            }}
          />
          <TouchableOpacity
            onPress={() => handleAddMember()}
            style={generalStyles.button}
            disabled={memberName.trim() === ''}
          >
            <Text>add member</Text>
          </TouchableOpacity>
          {memberNames.map((name, i) => {
            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Text
                  style={{
                    padding: 2
                  }}
                >{name}</Text>
                {/* <FontAwesome 
                  name="remove" 
                  size={20} 
                  color="red"
                  style={{
                    // backgroundColor: 'purple'

                  }}
                /> */}
                <Feather 
                  name="delete" 
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
      <TouchableOpacity
        onPress={() => handleAddParticipant()}
        style={generalStyles.button}
        disabled={isSubmitDisabled()}
      >
        <Text>submit</Text>
      </TouchableOpacity>
    </View>
  )
}