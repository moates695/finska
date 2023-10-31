import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from './store';
import PlayerListCard from './PlayerListCard';

export function PlayerListGroup() {
  const players = useSelector((state: RootState) => state.game.players)
  const [list, setList] = useState(players);

  useEffect(() => {
      setList(players);
  }, [players]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
       {list.slice(1).map((player) => {
          return (
            <PlayerListCard name={player.name}/>
          );
        })}
      <View style={styles.box}>
        <Text>Component 2</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 10,
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

export default PlayerListGroup;