import { useState } from "react";
import { Button, StyleSheet, View, TouchableOpacity, Text} from "react-native";

export default function ScoreInput() {
  const [selected, setSelected] = useState<number[]>(Array(12).fill(0));

  function handlePress(num: number) {
    let temp = [...selected];
    temp[num] = temp[num] ? 0 : 1;
    setSelected(temp);
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {[7, 8, 9].map((num) => {
          return (
            <TouchableOpacity onPress={() => {handlePress(num)}} style={[styles.button, selected[num] ? styles.selectedButton : null]}>
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.row}>
      {[5, 11, 12, 6].map((num) => {
          return (
            <TouchableOpacity onPress={() => {handlePress(num)}} style={[styles.button, selected[num] ? styles.selectedButton : null]}>
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.row}>
      {[3, 10, 4].map((num) => {
          return (
            <TouchableOpacity onPress={() => {handlePress(num)}} style={[styles.button, selected[num] ? styles.selectedButton : null]}>
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.row}>
      {[1, 2].map((num) => {
          return (
            <TouchableOpacity onPress={() => {handlePress(num)}} style={[styles.button, selected[num] ? styles.selectedButton : null]}>
              <Text style={styles.buttonText}>{num}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#2ecc71', // Green color when selected
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});