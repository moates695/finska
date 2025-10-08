import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import Dropdown, { DropdownOption } from "./Dropdown";

type ParticipantType = 'player' | 'team';
interface ParticipantOption {
  label: string
  value: ParticipantType
}

export default function AddParticipant() {
  const [isPlayer, setIsPlayer] = useState<boolean>(true); // remember last choice? (global state, no load in)
  const [name, setName] = useState<string>('');

  // todo check for name collisions before submitting new player / team

  const participantOptions: ParticipantOption[] = [
    { label: 'player', value: 'player' },
    { label: 'team', value: 'team' },
  ]
  const [participantValue, setParticipantValue] = useState<ParticipantType>('player');

  const handleChangeText = (text: string) => {
    setName(text);
  }

  return (
    <View>
      <Dropdown 
        options={participantOptions}
        selectedValue={participantValue}
        setSelectedValue={setParticipantValue}
      />
      <TextInput 
        value={name}
        onChangeText={(text) => handleChangeText(text)}
        returnKeyType="done"
        style={{
          borderColor: 'black',
          borderWidth: 1,
          borderRadius: 5,
          width: 200,
          padding: 4
        }}
      />
    </View>
  )
}