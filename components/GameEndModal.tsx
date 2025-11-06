import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from 'expo-blur';
import { generalStyles } from "@/styles/general";
import { useAtom, useAtomValue } from "jotai";
import { CompleteState, completeStateAtom, gameAtom, initialGame, screenAtom, showCompleteModalAtom, themeAtom } from "@/store/general";
import GameEndOptions, { GameEndOptionsProps } from "./GameEndOptions";

export function GameEndModal() {
  const [game, setGame] = useAtom(gameAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [, setShowCompleteModal] = useAtom(showCompleteModalAtom);
  const completeState = useAtomValue(completeStateAtom);
  const theme = useAtomValue(themeAtom);
  
  // const winContinue = () => {
  //   const tempState = {...game.state};
  //   for (const [id, state] of Object.entries(tempState)) {
  //     if (state.score < game.target_score) continue;
  //     tempState[id].score = game.reset_score;
  //   }

  //   setGame({
  //     ...game,
  //     state: tempState
  //   });
  // };

  const finishBack = () => {};
  
  // const loseReset = () => {
  //   const tempState = {...game.state};
  //   for (const [id, state] of Object.entries(tempState)) {
  //     tempState[id].score = 0;
  //     tempState[id].eliminated_turns = 0;
  //     tempState[id].num_misses = 0;
  //     if (state.standing === 'paused') continue;
  //     tempState[id].standing = 'playing';
  //   }

  //   setGame({
  //     ...game,
  //     state: tempState
  //   });
  // };

  const saveGame = () => {
    // todo save game?
    setGame({...initialGame});
    setScreen('game setup');
  };

  const wrapButtonPress = (func: () => void) => {
    func();
    setShowCompleteModal(false);
  };

  const props: Record<CompleteState, GameEndOptionsProps> = {
    win: {
      message: "We have a winner!",
      map: {
        left: {
          buttonText: 'continue',
          buttonPress: () => wrapButtonPress(winContinue),
          hasConfirm: true,
          confirmMessage: 'Are you sure you want to continue?'
        },
        right: {
          buttonText: 'finish',
          buttonPress: () => wrapButtonPress(saveGame),
          hasConfirm: true,
          confirmMessage: 'Are you sure you want to save & exit?'
        }
      }
    },
    finish: {
      message: "Do you want to finish this game?",
      map: {
        left: {
          buttonText: 'cancel',
          buttonPress: () => wrapButtonPress(finishBack),
          hasConfirm: false,
        },
        right: {
          buttonText: 'yes',
          buttonPress: () => wrapButtonPress(saveGame),
          hasConfirm: true,
          confirmMessage: 'Are you sure you want to save & exit?'
        }
      }
    },
    default: {
      message: "Winner by default!",
      map: {
        left: {
          buttonText: 'reset',
          buttonPress: () => wrapButtonPress(loseReset),
          hasConfirm: true,
          confirmMessage: 'Are you sure you want to reset?'
        },
        right: {
          buttonText: 'save',
          buttonPress: () => wrapButtonPress(saveGame),
          hasConfirm: true,
          confirmMessage: 'Are you sure you want to save & exit?'
        }
      }
    }
  } 

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.modalBackdrop,
        width: '100%',
      }}
    >
      <View
        style={{
          backgroundColor: theme.primaryBackground,
          width: 350,
          padding: 20,
          justifyContent: 'center',
          borderRadius: 20,
        }}
      >
        <GameEndOptions message={props[completeState].message} map={props[completeState].map}/>        
      </View>
    </View>
  )
}