import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AddParticipantButton from "./AddParticipantButton";
import AddParticipant from "./AddParticipant";
import { useAtom } from "jotai";
import { gameAtom, getDistinctUpNext, screenAtom, showNewParticipantModalAtom } from "@/store/general";
import ParticipantList from "./ParticipantList";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function GameSetup() {
  const [game, setGame] = useAtom(gameAtom);
  const [showNewParticipantModal, setShowNewParticipantModal] = useAtom(showNewParticipantModalAtom);
  const [, setScreen] = useAtom(screenAtom);
  
  const [shuffleUpNext, setShuffleUpNext] = useState<boolean>(true);
  
  const distinctUpNext = useMemo(() => {
    return getDistinctUpNext(game)
  }, [game.up_next]);

  useEffect(() => {
    if (showNewParticipantModal) return;
    setShowNewParticipantModal(true);
  }, []);

  // todo ask shuffle player/team order?
  // todo create game state 0
  const handlePressContinue = () => {
    setScreen('game');
    setGame({
      ...game,
      has_game_started: true
    })
  };

  const disabledContinue = () => {
    return distinctUpNext.playing.length <= 1;
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          position: 'absolute',
          top: 10,
          paddingLeft: 20,
          paddingRight: 20,
          // left: 20,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '500',
          }}
        >
          Setup your game
        </Text>
        {!disabledContinue() &&
        <TouchableOpacity
          onPress={handlePressContinue}
          disabled={disabledContinue()}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end'
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '400',
              }}
            >
              continue
            </Text>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color="black"
              style={{
                marginBottom: 2,
              }} 
            />
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color="black"
              style={{
                marginBottom: 2,
                marginLeft: -8,
              }} 
            />
          </View>
        </TouchableOpacity>
        }

      </View>
      {distinctUpNext.playing.length === 0 ?
        <Text>add players or teams below</Text>
      :
        <ParticipantList />
      }
      <AddParticipant showButton={false}/>
    </View>
  )
}