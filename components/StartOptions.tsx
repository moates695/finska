import { gameAtom, initialGame, screenAtom, showNewParticipantModalAtom, themeAtom } from "@/store/general";
import { generalStyles } from "@/styles/general";
import { useAtom, useAtomValue } from "jotai";
import React, { useState } from "react";
import { TouchableOpacity, Text, View, StyleSheet} from "react-native";
import Scoreboard from "./Scoreboard";
import { themes } from "@/styles/theme";

export default function StartOptions() {
  const [, setGame] = useAtom(gameAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [, setShowNewParticipantModal] = useAtom(showNewParticipantModalAtom);
  const theme = useAtomValue(themeAtom);

  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const handleContinueGame = () => {
    setScreen('game');
  };

  const handlePressStartNewGame = () => {
    setShowConfirmation(true);
  };

  const handleCancelConfirm = () => {
    setShowConfirmation(false);
  };

  const handleConfirmStartNewGame = () => {
    setGame(initialGame);
    setScreen('game setup');
    setShowNewParticipantModal(true);
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
          width: '100%',
          height: '60%', 
          alignItems: 'center',
          // backgroundColor: 'red',
        }}
      >
        <Scoreboard />
      <View
        style={{
          height: 150,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
      {showConfirmation ? 
        <>
          <Text
            style={{
              fontSize: 16
            }}
          >
            Are you sure?
          </Text>
          <Text
            style={{
              marginBottom: 10,
            }}
          >
            This will overwrite the existing game
          </Text>
          <TouchableOpacity
            style={[
              generalStyles.button,
              generalStyles.bigButton,
              {
                marginBottom: 10,
                borderColor: theme.border
              }
            ]}
            onPress={handleConfirmStartNewGame}
          >
            <Text
              style={{
                color: theme.text
              }}
            >
              yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              generalStyles.button,
              generalStyles.bigButton,
              {
                borderColor: theme.border
              }
            ]}
            onPress={handleCancelConfirm}
          >
            <Text
              style={{
                color: theme.text
              }}
            >
              back
            </Text>
          </TouchableOpacity>
        </>
      :
        <>
          <TouchableOpacity
            style={[
              generalStyles.button,
              generalStyles.bigButton,
              {
                marginBottom: 10,
                borderColor: theme.border
              }
            ]}
            onPress={handleContinueGame}
          >
            <Text
              style={{
                color: theme.text
              }}
            >
              continue game
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              generalStyles.button,
              generalStyles.bigButton,
              {
                borderColor: theme.border
              }
            ]}
            onPress={handlePressStartNewGame}
          >
            <Text
              style={{
                color: theme.text
              }}
            >
              start new game
            </Text>
          </TouchableOpacity>
        </>
        
      }
      </View>
      </View>
        
    </View>
  )
}

const styles = StyleSheet.create({
})