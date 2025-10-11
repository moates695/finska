import React from "react";
import { View, Text } from "react-native";
import PinMap from "./PinMap";
import { useAtom } from "jotai";
import { gameAtom } from "@/store/general";
import UpNext from "./UpNext";

export default function Game() {
  const [game, setGame] = useAtom(gameAtom);

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
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom: 20,
        }}
      >
        <UpNext />
        <PinMap />
      </View>
    </View>
  )
}