import React from "react";
import { View, Text } from "react-native";
import PinMap from "./PinMap";
import { useAtom } from "jotai";
import { gameAtom } from "@/store/general";
import UpNext from "./UpNext";
import Scoreboard from "./Scoreboard";
import { Col, Row, Grid } from "react-native-easy-grid";

export default function Game() {
  const [game, setGame] = useAtom(gameAtom);

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
    </View>
  )
}