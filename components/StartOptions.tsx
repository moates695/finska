import { gameAtom, initialGame, screenAtom, showNewParticipantModalAtom } from "@/store/general";
import { generalStyles } from "@/styles/general";
import { useAtom } from "jotai";
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";


export default function StartOptions() {
  const [, setGame] = useAtom(gameAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [, setShowNewParticipantModal] = useAtom(showNewParticipantModalAtom);

  const handleContinueGame = () => {
    setScreen('game');
  };

  const handleStartNewGame = () => {
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
      <TouchableOpacity
        style={generalStyles.button}
        onPress={handleContinueGame}
      >
        <Text>continue game</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={generalStyles.button}
        onPress={handleStartNewGame}
      >
        <Text>start new game</Text>
      </TouchableOpacity>
    </View>
  )
}