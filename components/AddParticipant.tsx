import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import Dropdown, { DropdownOption } from "./Dropdown";
import { generalStyles } from "@/styles/general";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Constants from 'expo-constants';
import { useAtom } from "jotai";
import { Game, gameAtom, Player, Team } from "@/store/general";

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
    const gameNames = game.participants.map(object => object.name);
    const existingNames = [name.trim()].concat(memberNames).concat(gameNames);
    return existingNames.some((name) => { return name === newName});
  }

  const handleAddMember = () => {
    const newMember = memberName.trim();
    if (newMember === '' || isNameTaken(newMember)) return;

    setMemberNames((prev) => [...prev, memberName]);
    setMemberName('');
  };

  const handleAddParticipant = () => {
    const newName = name.trim();
    if (newName === '' || isNameTaken(newName)) return;

    if (isPlayer) {
      const newPlayer: Player  = {
        id: crypto.randomUUID(),
        name
      }

      setGame((prev) => {
        const game = prev as Awaited<Game>;
        return {
          ...game,
          participants: [...game.participants, newPlayer],
          // up_next: [...game.up_next]
        };
      });

    } else {
      const members: Player[] = [];
      for (const name of memberNames) {
        members.push({
          id: crypto.randomUUID(),
          name
        })
      }
      const newTeam: Team = {
        id: crypto.randomUUID(),
        name,
        members
      }

      setGame((prev) => {
        const game = prev as Awaited<Game>;
        return {
          ...game,
          participants: [...game.participants, newTeam]
        };
      });
    }
  };

  const isSubmitDisabled = (): boolean => {
    if (name.trim() === '') return true;
    if (!isPlayer && memberNames.length === 0) return true;
    return false;
  };

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
          width: 200,
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
              width: 200,
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
                <Text>{name}</Text>
                <FontAwesome 
                  name="remove" 
                  size={20} 
                  color="red" 
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