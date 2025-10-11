import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AddParticipantButton from "./AddParticipantButton";
import AddParticipant from "./AddParticipant";
import { useAtom } from "jotai";
import { gameAtom, screenAtom, showNewParticipantModalAtom } from "@/store/general";
import ParticipantList from "./ParticipantList";
import Ionicons from '@expo/vector-icons/Ionicons';

export default function GameSetup() {
  const [game, setGame] = useAtom(gameAtom);
  const [showNewParticipantModal, setShowNewParticipantModal] = useAtom(showNewParticipantModalAtom);
  const [, setScreen] = useAtom(screenAtom);
  
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
    return game.up_next.length === 0;
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
      {Object.keys(game.up_next).length === 0 ?
        <Text>add players or teams below</Text>
      :
        <ParticipantList />
      }
      <AddParticipant showButton={false}/>
    </View>
  )
}