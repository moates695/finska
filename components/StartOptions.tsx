import { gameAtom, initialGame, screenAtom, showNewParticipantModalAtom } from "@/store/general";
import { generalStyles } from "@/styles/general";
import { useAtom } from "jotai";
import React, { useState } from "react";
import { TouchableOpacity, Text, View } from "react-native";

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
      {showConfirmation ? 
        <>
        <Text>Are you sure?</Text>
        <Text>This will overwrite the existing game</Text>
          <TouchableOpacity
            style={generalStyles.button}
            onPress={handleConfirmStartNewGame}
          >
            <Text>yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={generalStyles.button}
            onPress={handleCancelConfirm}
          >
            <Text>back</Text>
          </TouchableOpacity>
        </>
      :
        <>
          <TouchableOpacity
            style={generalStyles.button}
            onPress={handleContinueGame}
          >
            <Text>continue game</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={generalStyles.button}
            onPress={handlePressStartNewGame}
          >
            <Text>start new game</Text>
          </TouchableOpacity>
        </>
      }
        
    </View>
  )
}