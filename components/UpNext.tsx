import { gameAtom, ParticipantType } from "@/store/general";
import { useAtom } from "jotai";
import React from "react";
import { View, Text } from "react-native";

interface ParticipantName {
  type: ParticipantType,
  name: string,
  memberName?: string
}

export default function UpNext() {
  const [game, setGame] = useAtom(gameAtom);
  
  // todo: fix this
  // const getParticipant = (id: string): ParticipantName => {
  //   if (id in game.players) {
  //     return {
  //       type: 'player',
  //       name: game.players[id]
  //   }
  //   const team = game.teams[id];
  //   return {
  //     type: 'team',
  //     name: team.name,
  //     members: team
  //   }
  // };

  return (
    <View
      style={{
        backgroundColor: 'orange',
        width: '95%'
      }}
    >
      <View>
        <Text>Now: </Text>
      </View>
    </View>
  )
}