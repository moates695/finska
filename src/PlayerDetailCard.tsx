import { StyleSheet, Text, View } from "react-native";
import { PlayerState } from "./gameSlice";

interface PlayerDetailCardProps {
  player: PlayerState
}

export default function PlayerDetailCard(props: PlayerDetailCardProps) {
  const { player } = props;

  return (
    <View style={styles.centeredView}>
      <Text>{player.name}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});