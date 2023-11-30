import { useSelector } from "react-redux";
import { RootState } from "./store";
import PlayerDetailCard from "./PlayerDetailCard";
import { ScrollView, StyleSheet } from "react-native";
import { PlayerState } from "./appSlice";

export default function PlayerDetailGroup() {
  const players: PlayerState[] = useSelector((state: RootState) => state.app.game.players);
  // TODO add edit last score button here or on game screen (last turn only?)
  // TODO add in a way to let back in players who are eliminated
  return (
    <ScrollView contentContainerStyle={styles.container} style={{maxHeight: 200}}>
      {players.map((player) => {
        return (
          <PlayerDetailCard key={`playerDetail.${player.name}`} player={player}/>
        );
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'center',
    width: 200,
  },
  box: {
    width: 200,
    height: 50,
    backgroundColor: 'lightblue',
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});