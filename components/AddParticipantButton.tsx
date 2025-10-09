import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAtom } from "jotai";
import { showNewParticipantModalAtom } from "@/store/general";

export default function AddParticipantButton() {
  const [showNewParticipantModal, setShowNewParticipantModal] = useAtom(showNewParticipantModalAtom);
  
  return (
    <>
      <TouchableOpacity
        onPress={() => setShowNewParticipantModal(!showNewParticipantModal)}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
        }}
      >
        {showNewParticipantModal ?
          <Ionicons 
            name="person-remove" 
            size={30} 
            color="black"
          />
        :
          <Ionicons 
            name="person-add-outline" 
            size={30}
            color="black" 
          />
        }
      </TouchableOpacity>
    </>
  )
}