import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Switch, StyleSheet } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtom } from "jotai";
import { gameAtom, initialGame, screenAtom } from "@/store/general";
import { generalStyles } from "@/styles/general";

// target score
// reset score
// elimination count
// elimination reset score
// elimination reset turns
// skip is miss
// use pin value


export default function Settings() {
  const [game, setGame] = useAtom(gameAtom);
  const [, setScreen] = useAtom(screenAtom);

  const [targetScore, setTargetScore] = useState<string>(game.target_score.toString());
  const [resetScore, setResetScore] = useState<string>(game.reset_score.toString());
  const [eliminationCount, setEliminationCount] = useState<string>(game.elimination_count.toString());
  const [eliminationScore, setEliminationScore] = useState<string>(game.elimination_reset_score.toString());
  const [eliminationTurns, setEliminationTurns] = useState<string>((game.elimination_reset_turns ?? '').toString());
  const [skipIsMiss, setSkipIsMiss] = useState<boolean>(game.skip_is_miss);
  const [usePinValue, setUsePinValue] = useState<boolean>(game.use_pin_value);

  const [targetScoreError, setTargetScoreError] = useState<string | null>(null);
  const [resetScoreError, setResetScoreError] = useState<string | null>(null);
  const [eliminationCountError, setEliminationCountError] = useState<string | null>(null);
  const [eliminationScoreError, setEliminationScoreError] = useState<string | null>(null);
  const [eliminationTurnsError, setEliminationTurnsError] = useState<string | null>(null);

  const handleChangeScore = (
    text: string,
    set: Dispatch<SetStateAction<string>>, 
    setError: Dispatch<SetStateAction<string | null>>,
    allowEmpty: boolean = false
  ) => {
    try {
      if (!allowEmpty && text === '') {
        set('');
        setError('invalid score');
        return;
      };
      if (allowEmpty && (text === '' || text === '-' || text === '0')) {
        set('');
        setError(null);
        return;
      }
      let num = Math.abs(parseInt(text));
      if (!num) throw new Error(`bad num '${num}'`);
      set(num.toString());
      setError(null);
    } catch (error) {
      console.log(error);
      setError('invalid score');
    }
  };

  const tooBigError = 'reset score too big'

  const handleChangeReset = (
    text: string, 
    setter: Dispatch<SetStateAction<string>>, 
    setError: Dispatch<SetStateAction<string | null>>
  ) => {
    try {
      if (text === '' || text === '-') {
        setter(text);
        setError('invalid reset score');
        return;
      };
      let num = parseInt(text);
      if (!num && num !== 0) throw new Error(`bad num '${num}'`);
      setter(num.toString());
      if (num >= parseInt(targetScore)) {
        setError(tooBigError);
      } else {
        setError(null);
      }
    } catch (error) {
      console.log(error);
      setError('invalid reset score');
    }
  };

  const handleDefaults = () => {
    setTargetScore(initialGame.target_score.toString());
    setResetScore(initialGame.reset_score.toString());
    setEliminationCount(initialGame.elimination_count.toString());
    setEliminationScore(initialGame.elimination_reset_score.toString());
    setEliminationTurns((initialGame.elimination_reset_turns ?? '').toString());
  };

  const handleSave = () => {
    const tempTarget = parseInt(targetScore) ?? game.target_score;
    const tempReset = parseInt(resetScore) ?? game.reset_score;
    const tempElimCount = parseInt(eliminationCount) ?? game.elimination_count;
    const tempElimReset = parseInt(eliminationScore) ?? game.elimination_reset_score;
    
    if (tempReset >= tempTarget || tempElimReset >= tempTarget) return;
    
    let tempElimTurns: number | null = game.elimination_reset_turns;
    if (eliminationTurns === '') {
      tempElimTurns = null;
    } else {
      try {
        const num = parseInt(eliminationTurns);
        if (Number.isNaN(num)) throw Error('could not convert turns to int');
        tempElimTurns = num;
      } catch (error) {
        console.log(error);
      }
    }

    const tempGame = {...game}
    for (const [id, currState] of Object.entries(game.state)) {
      const tempState = tempGame.state[id];
      
      if (currState.standing !== 'eliminated' && currState.score >= tempTarget) {
        tempState.score = tempReset;
      }
      
      if (currState.standing === 'eliminated') {
        const cond1 = currState.num_misses < tempElimCount;
        const cond2 = tempElimTurns !== null && currState.eliminated_turns >= tempElimTurns;
        if (cond1 || cond2) {
          tempState.score = tempElimReset;
          tempState.standing = 'playing';
          tempState.eliminated_turns = 0;
          tempState.num_misses = 0;
          continue;
        }
      } else {
        if (currState.num_misses >= tempElimCount) {
          tempState.standing = 'eliminated';
        }
      }
    }

    setGame({
      ...tempGame,
      target_score: tempTarget,
      reset_score: tempReset,
      elimination_count: tempElimCount,
      elimination_reset_score: tempElimReset,
      elimination_reset_turns: tempElimTurns,
      skip_is_miss: skipIsMiss,
      use_pin_value: usePinValue
    })
  };

  
  useEffect(() => {
    const tempTarget = parseInt(targetScore) ?? game.target_score;
    const tempReset = parseInt(resetScore) ?? game.reset_score;
    
    if (tempTarget <= tempReset) {
      setResetScoreError(tooBigError);
      return;
    } else if (resetScoreError === tooBigError) {
      setResetScoreError(null);
    }
  }, [targetScore]);

  useEffect(() => {
    const tempTarget = parseInt(targetScore) ?? game.target_score;
    const tempElimReset = parseInt(eliminationScore) ?? game.elimination_reset_score;

    if (tempTarget <= tempElimReset) {
      setEliminationScoreError(tooBigError);
      return;
    } else if (eliminationScoreError === tooBigError) {
      setEliminationScoreError(null);
    }
  }, [targetScore]);

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: '90%',
          justifyContent: 'center',
          backgroundColor: '#e2d298ff',
          padding: 20,
          borderRadius: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => setScreen('game')}
          style={{
            marginBottom: 20
          }}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color="black"
          />
        </TouchableOpacity>
        <View
          style={styles.inputRow}
        >
          <View
            style={styles.inputContainer}
          >
            <Text>
              Target score:
            </Text>
            <TextInput
              value={targetScore}
              onChangeText={(text) => handleChangeScore(text, setTargetScore, setTargetScoreError)}
              returnKeyType="done"
              keyboardType="number-pad"
              style={{
                borderColor: 'black',
                borderWidth: 1,
                borderRadius: 5,
                width: 100,
                padding: 4,
                height: 40,
                marginRight: 5,
                textAlign: 'center',
              }}
            >
            </TextInput>
            <Text
              style={{
                fontSize: 12,
                color: 'red',
                opacity: targetScoreError !== null ? 1 : 0,
              }}
            >
              {targetScoreError}
            </Text>
          </View>
          <View
            style={styles.inputContainer}
          >
            <Text>
              Reset score:
            </Text>
            <TextInput
              value={resetScore}
              onChangeText={(text) => handleChangeReset(text, setResetScore, setResetScoreError)}
              returnKeyType="done"
              keyboardType="number-pad"
              style={{
                borderColor: 'black',
                borderWidth: 1,
                borderRadius: 5,
                width: 100,
                padding: 4,
                height: 40,
                marginRight: 5,
                textAlign: 'center',
              }}
            >
            </TextInput>
            <Text
              style={{
                fontSize: 12,
                color: 'red',
                opacity: resetScoreError !== null ? 1 : 0,
              }}
            >
              {resetScoreError}
            </Text>
          </View>
        </View>
        <View
          style={styles.inputRow}
        >
          <View
            style={styles.inputContainer}
          >
            <Text>
              Eliminate after:
            </Text>
            <TextInput
              value={eliminationCount}
              onChangeText={(text) => handleChangeScore(text, setEliminationCount, setEliminationCountError)}
              returnKeyType="done"
              keyboardType="number-pad"
              style={{
                borderColor: 'black',
                borderWidth: 1,
                borderRadius: 5,
                width: 100,
                padding: 4,
                height: 40,
                marginRight: 5,
                textAlign: 'center',
              }}
            >
            </TextInput>
            <Text
              style={{
                fontSize: 12,
                color: 'red',
                opacity: eliminationCountError !== null ? 1 : 0,
              }}
            >
              {eliminationCountError}  
            </Text>
          </View>
          <View
            style={styles.inputContainer}
          >
            <Text>
              Eliminate reset:
            </Text>
            <TextInput
              value={eliminationScore}
              onChangeText={(text) => handleChangeReset(text, setEliminationScore, setEliminationScoreError)}
              returnKeyType="done"
              keyboardType="number-pad"
              style={{
                borderColor: 'black',
                borderWidth: 1,
                borderRadius: 5,
                width: 100,
                padding: 4,
                height: 40,
                marginRight: 5,
                textAlign: 'center',
              }}
            >
            </TextInput>
            <Text
              style={{
                fontSize: 12,
                color: 'red',
                opacity: eliminationScoreError !== null ? 1 : 0,
              }}
            >
              {eliminationScoreError}
            </Text>
          </View>
        </View>
        <View
          style={styles.inputRow}
        >
          <View
            style={[
              styles.inputContainer,
              {
                marginBottom: -10,
              }              
            ]}
          >
            <Text>
              Eliminate turns:
            </Text>
            <TextInput
              value={eliminationTurns}
              onChangeText={(text) => handleChangeScore(text, setEliminationTurns, setEliminationTurnsError, true)}
              returnKeyType="done"
              keyboardType="number-pad"
              placeholder="never"
              style={{
                borderColor: 'black',
                borderWidth: 1,
                borderRadius: 5,
                width: 100,
                padding: 4,
                height: 40,
                marginRight: 5,
                textAlign: 'center',
              }}
            >
            </TextInput>
            <Text
              style={{
                fontSize: 12,
                color: 'red',
                opacity: eliminationTurnsError !== null ? 1 : 0,
              }}
            >
              {eliminationTurnsError}
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-around',
            marginBottom: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text>
              Skip counts as miss:
            </Text>
            <Switch
              value={skipIsMiss}
              onValueChange={() => setSkipIsMiss(!skipIsMiss)}
              trackColor={{true: '#b4fcac', false: '#767577'}}
              thumbColor={skipIsMiss ? '#1aff00' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text>
              Use pin value:
            </Text>
            <Switch
              value={usePinValue}
              onValueChange={() => setUsePinValue(!usePinValue)}
              trackColor={{true: '#b4fcac', false: '#767577'}}
              thumbColor={usePinValue ? '#1aff00' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
        </View>
        <View
          style={styles.inputRow}
        >
          <TouchableOpacity
            onPress={handleDefaults}
            style={[
              generalStyles.button,
              generalStyles.bigButton
            ]}
          >
            <Text>defaults</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={[
              generalStyles.button,
              generalStyles.bigButton
            ]}
          >
            <Text>save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  inputContainer: {
    flexDirection: 'column'
  }
})