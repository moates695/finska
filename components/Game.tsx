import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import PinMap from "./PinMap";
import { useAtom, useAtomValue } from "jotai";
import { completeStateAtom, gameAtom, screenAtom, showAddParticipantAtom, showCompleteModalAtom, themeAtom } from "@/store/general";
import UpNext from "./UpNext";
import Scoreboard from "./Scoreboard";
import { Col, Row, Grid } from "react-native-easy-grid";
import { GameEndModal } from "./GameEndModal";
import Ionicons from '@expo/vector-icons/Ionicons';
import AddParticipantModal from "./AddParticipantModal";

export default function Game() {
  const [, setScreen] = useAtom(screenAtom);
  const showCompleteModal = useAtomValue(showCompleteModalAtom);
  const [, setComplateState] = useAtom(completeStateAtom);
  const [, setShowCompleteModal] = useAtom(showCompleteModalAtom);
  const theme = useAtomValue(themeAtom);

  const [showAddParticipant, setShowAddParticipant] = useAtom(showAddParticipantAtom);

  const handlePressSave = () => {
    setComplateState('finish');
    setShowCompleteModal(true);
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Scoreboard />
      <UpNext />
      <PinMap />
      {/* {showAddParticipant && <AddParticipantModal /> } */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '90%',
          marginBottom: 5,
          paddingLeft: 20,
          paddingRight: 25,
        }}
      >
        <TouchableOpacity
          onPress={() => setScreen('settings')}
        >
          <Ionicons 
            name="settings-outline" 
            size={24}
            color={theme.staticButton}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePressSave}
        >
          <Ionicons 
            name="save-outline" 
            size={24} 
            color={theme.staticButton}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowAddParticipant(!showAddParticipant)}
        >
          <Ionicons 
            name={showAddParticipant ? "person-remove" : "person-add-outline"} 
            size={24}
            color={theme.staticButton}
          />
        </TouchableOpacity>
      </View>
      <Modal 
        visible={showCompleteModal}
        transparent={true}
        onRequestClose={() => {}}
        animationType='fade'
      >
        <GameEndModal />
      </Modal>
    </View>
  )
}