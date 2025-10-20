import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, Switch, Platform, KeyboardAvoidingView } from "react-native";
import { useAtom, useAtomValue } from "jotai";
import { gameAtom, getDistinctUpNext, screenAtom, showNewParticipantModalAtom, themeAtom } from "@/store/general";
import ParticipantList from "./ParticipantList";
import Ionicons from '@expo/vector-icons/Ionicons';
import AddParticipantModal from "./AddParticipantModal";

export default function GameSetup() {
  const [game, setGame] = useAtom(gameAtom);
  const [showNewParticipantModal, setShowNewParticipantModal] = useAtom(showNewParticipantModalAtom);
  const [, setScreen] = useAtom(screenAtom);
  const theme = useAtomValue(themeAtom);
  
  const [shuffleOrder, setShuffleOrder] = useState<boolean>(true);

  const distinctUpNext = useMemo(() => {
    return getDistinctUpNext(game)
  }, [game.up_next]);

  useEffect(() => {
    if (showNewParticipantModal) return;
    setShowNewParticipantModal(true);
  }, []);

  function shuffle(array: Array<any>) {
    try {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    } catch (error) {
      console.log(error);
      return array;
    };
  }
  
  const handlePressContinue = () => {
    setScreen('game');

    let up_next = [...game.up_next];
    let up_next_members = {...game.up_next_members};
    if (shuffleOrder) {
      up_next = shuffle(up_next); 
      for (const [id, members] of Object.entries(up_next_members)) {
        up_next_members[id] = shuffle(members);
      }
    }

    setGame({
      ...game,
      up_next,
      up_next_members,
      has_game_started: true
    })
  };

  const disabledContinue = () => {
    return distinctUpNext.playing.length <= 1;
  };

  return (
    // <KeyboardAvoidingView 
    //       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    //       keyboardVerticalOffset={Platform.OS === 'android' ? 10 : 10} 
    //       style={{
    //     flex: 1,
    //     width: '100%',
    //   }}
    //     >
    <View
      style={{
        flex: 1,
        width: '100%',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          width: '100%',
          paddingLeft: 20,
          paddingRight: 20,
          paddingBottom: 10,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: '500',
            color: theme.text
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
                  color: theme.text,
                }}
              >
                continue
              </Text>
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={theme.staticButton}
                style={{
                  marginBottom: 2,
                }} 
              />
              <Ionicons 
                name="chevron-forward" 
                size={16} 
                color={theme.staticButton}
                style={{
                  marginBottom: 2,
                  marginLeft: -8,
                }} 
              />
            </View>
          </TouchableOpacity>
        }
      </View>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'space-around',
        }}
      >
        <View 
          style={{ 
            flex: 1, 
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 20,
            marginBottom: 30,
          }}
        >
          <ParticipantList />
        </View>
        <AddParticipantModal />
        <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: theme.text
              }}
            >
              Shuffle order:
            </Text>
            <Switch
              value={shuffleOrder}
              onValueChange={() => setShuffleOrder(!shuffleOrder)}
              trackColor={{true: theme.switchTrackOn, false: theme.switchTrackOff}}
              thumbColor={shuffleOrder ? theme.switchThumbOn : theme.switchThumbOff}
              ios_backgroundColor={theme.switchIosBackground}
            />
          </View>
      </View>
    </View>
    
  )
}