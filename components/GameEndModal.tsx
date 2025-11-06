import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { BlurView } from 'expo-blur';
import { generalStyles } from "@/styles/general";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { CompleteState, completeStateAtom, gameAtom, initialGame, screenAtom, showCompleteModalAtom, themeAtom } from "@/store/general";
import GameEndOptions, { GameEndOptionsProps } from "./GameEndOptions";
import { loseResetAtom, saveGameAtom, winContinueAtom } from "@/store/actions";

export function GameEndModal() {
  const [game, setGame] = useAtom(gameAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [, setShowCompleteModal] = useAtom(showCompleteModalAtom);
  const completeState = useAtomValue(completeStateAtom);
  const theme = useAtomValue(themeAtom);
  
  const winContinue = useSetAtom(winContinueAtom);
  const loseReset = useSetAtom(loseResetAtom);
  const saveGame = useSetAtom(saveGameAtom);

  const finishBack = () => {};

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