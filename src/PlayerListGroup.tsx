import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import PlayerListCard from './PlayerListCard';

export default function PlayerListGroup() {
  const players = useSelector((state: RootState) => state.game.players)

  return (
    <ScrollView contentContainerStyle={styles.container}>
       {players.slice(0).map((player) => {
          return (
            <PlayerListCard key={`playerList.${player.name}`} original={player.name}/>
          );
        })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 10,
    backgroundColor: 'blue',
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