import React from "react";
import { View, Text } from "react-native";
import AddParticipantModal from "./AddParticipantModal";
import AddParticipantButton from "./AddParticipantButton";
import { useAtomValue } from "jotai";
import { showNewParticipantModalAtom } from "@/store/general";

export interface AddParticipantProps {
  showButton: boolean 
  showShuffle: boolean
}

export default function AddParticipant(props: AddParticipantProps) {
  const { showButton, showShuffle } = props;
  
  const showNewParticipantModal = useAtomValue(showNewParticipantModalAtom);
  
  return (
    <>
      {showButton && <AddParticipantButton />}
      {showNewParticipantModal &&
        <AddParticipantModal showShuffle={showShuffle}/>
      }
    </>
  )
}