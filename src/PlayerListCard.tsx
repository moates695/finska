import { Text, StyleSheet } from 'react-native';

interface PlayerListCardProps {
  name: String,
}

export function PlayerListCard({ name }: PlayerListCardProps) {
  return (
    <Text style={styles.box}>{name}</Text>
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

export default PlayerListCard;