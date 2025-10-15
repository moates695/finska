import { gameAtom, initialGame, screenAtom, showNewParticipantModalAtom } from "@/store/general";
import { generalStyles } from "@/styles/general";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { TouchableOpacity, Text, View, StyleSheet} from "react-native";
import Scoreboard from "./Scoreboard";

// todo show current game stats (to determine whether to continue or not)
export default function StartOptions() {
  const [, setGame] = useAtom(gameAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [, setShowNewParticipantModal] = useAtom(showNewParticipantModalAtom);

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
              }
            ]}
            onPress={handleConfirmStartNewGame}
          >
            <Text>yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              generalStyles.button,
              generalStyles.bigButton
            ]}
            onPress={handleCancelConfirm}
          >
            <Text>back</Text>
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
              }
            ]}
            onPress={handleContinueGame}
          >
            <Text>continue game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              generalStyles.button,
              generalStyles.bigButton
            ]}
            onPress={handlePressStartNewGame}
          >
            <Text>start new game</Text>
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