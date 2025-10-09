import React, { useEffect } from "react";
import { View, Text } from "react-native";
import AddParticipantButton from "./AddParticipantButton";
import AddParticipant from "./AddParticipant";
import { useAtom } from "jotai";
import { gameAtom, showNewParticipantModalAtom } from "@/store/general";
import ParticipantList from "./ParticipantList";

export default function GameSetup() {
  const [game, setGame] = useAtom(gameAtom);
  const [showNewParticipantModal, setShowNewParticipantModal] = useAtom(showNewParticipantModalAtom);
  
  useEffect(() => {
    if (showNewParticipantModal) return;
    setShowNewParticipantModal(true);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Text
        style={{
          position: 'absolute',
          top: 10,
          left: 20,
          fontSize: 24,
          fontWeight: '500',
        }}
      >
        Setup your game
      </Text>
      {Object.keys(game.up_next).length === 0 ?
        <Text>add players or teams below</Text>
      :
        <ParticipantList />
      }
      <AddParticipant showButton={false}/>
    </View>
  )
}