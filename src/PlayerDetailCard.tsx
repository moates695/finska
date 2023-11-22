import { StyleSheet, Text, View } from "react-native";
import { PlayerState } from "./gameSlice";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "./store";

interface PlayerDetailCardProps {
  player: PlayerState
}

export default function PlayerDetailCard(props: PlayerDetailCardProps) {
  const { player } = props;
  const settings = useSelector((state: RootState) => state.settings);

  return (
    <View style={styles.centeredView}>
      <Text style={styles.item}>{player.strikes}</Text>
      <Text style={styles.item}>{player.name}</Text>
      <Text style={styles.item}>{player.score}</Text>
      <Text style={styles.item}>{settings.target - player.score}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  item: {
    padding: 10,
    fontSize: 12,
    height: 36,
  }
});