import { useState } from "react";
import { Button, StyleSheet, View, TouchableOpacity, Text} from "react-native";
import { enterTurn, skipTurn } from "./gameSlice";
import { useDispatch, useSelector } from "react-redux";

export default function ScoreInput() {
  const emptyArray = Array(12).fill(0);
  const [selected, setSelected] = useState<number[]>(emptyArray);
  
  const settings = useSelector((state: any) => state.settings);
  const dispatch = useDispatch();

  function handlePress(num: number) {
    let temp = [...selected];
    temp[num] = temp[num] ? 0 : 1;
    setSelected(temp);
  }

  function handleClear() {
    setSelected(emptyArray);
  }

  function handleSubmit() {
    let score = selected.filter(num => num === 1).length;
    if (score === 0 || (score > 1 && settings.scoreType === 'original')) {
      dispatch(enterTurn(score));
      setSelected(emptyArray);
      return;
    }
    score = 0;
    for (let i in selected) {
      if (!selected[i]) continue;
      score += parseInt(i);
    }
    dispatch(enterTurn(score));
    setSelected(emptyArray);
  }

  function handleSkip() {
    dispatch(skipTurn());
    setSelected(emptyArray);
  }

  return (
    <View style={styles.container}>
      {[[7,8,9], [5,11,12,6], [3,10,4], [1,2]].map((row) => {
        return (
          <View style={styles.row} key={`buttonRow${row}`}>
            {row.map((num) => {
              return (
                <TouchableOpacity onPress={() => {handlePress(num)}} style={[styles.button, selected[num] ? styles.selectedButton : null]} key={`button${num}`}>
                  <Text style={styles.buttonText}>{num}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )
      })}
    <View style={styles.row}>
      <TouchableOpacity onPress={() => {handleClear()}} style={styles.button}>
        <Text style={{color: 'black'}}>clear</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {handleSkip()}} style={styles.button}>
        <Text style={{color: 'black'}}>skip</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => {handleSubmit()}} style={styles.button}>
        <Text style={{color: 'black'}}>submit</Text>
      </TouchableOpacity>
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
    margin: 2,
    borderRadius: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#2ecc71', // Green color when selected
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});