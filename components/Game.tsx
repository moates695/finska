import React from "react";
import { View, Text } from "react-native";
import PinMap from "./PinMap";

export default function Game() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <PinMap />
    </View>
  )
}