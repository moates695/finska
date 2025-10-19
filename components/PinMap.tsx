import React, { useMemo, useState } from "react";
import { View, Text, Touchable, TouchableOpacity } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { completeStateAtom, gameAtom, gameIsValid, GameState, getDistinctUpNext, getMaxScore, ParticipantStanding, screenAtom, showAddParticipantAtom, showCompleteModalAtom, themeAtom } from "@/store/general";
import { useAtom, useAtomValue } from "jotai";
import AddParticipantModal from "./AddParticipantModal";

// todo handle win, handle game invalidated (eliminations)
export default function PinMap() {
  const [game, setGame] = useAtom(gameAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [, setComplateState] = useAtom(completeStateAtom);
  const [, setShowCompleteModal] = useAtom(showCompleteModalAtom);
  const theme = useAtomValue(themeAtom);
  const [showAddParticipant, setShowAddParticipant] = useAtom(showAddParticipantAtom);
  
  
  const [selectedPins, setSelectedPins] = useState<Set<number>>(new Set());

  const pressPin = (number: number) => {
    setSelectedPins(prev => {
      const next = new Set(prev);
      if (next.has(number)) next.delete(number)
      else next.add(number);
      return next;
    })
  };

  const isPinSelected = (number: number): boolean => {
    return selectedPins.has(number);
  };

  const countPins = (): number => {
    if (game.use_pin_value) {
      return [...selectedPins].reduce((a, b) => a + b, 0);
    }

    if (selectedPins.size === 1) {
      return [...selectedPins][0];
    }
    return selectedPins.size;
  };

  const handleSubmit = () => {
    const id = game.up_next[0];

    const count = countPins();
    let newScore = count + game.state[id].score;
    if (newScore === game.target_score) {
      setComplateState('win');
      setShowCompleteModal(true);
    } else if (newScore > game.target_score) {
      newScore = game.reset_score;
    }

    const tempState = {...game.state};
    
    tempState[id] = {
      ...tempState[id],
      score: newScore
    };

    let index = 1;
    for (const [i, id] of game.up_next.slice(1).entries()) {
      if (game.state[id].standing === 'playing') {
        index = i + 1;
        break;
      } else if (game.state[id].standing === 'eliminated') {
        tempState[id].eliminated_turns++;
        if (game.elimination_reset_turns && tempState[id].eliminated_turns >= game.elimination_reset_turns) {
          tempState[id].standing = 'playing';
          tempState[id].num_misses = 0;
          tempState[id].eliminated_turns = 0;
        }
      }
    }

    let up_next_members = {...game.up_next_members};
    if (id in game.teams) {
      up_next_members = {
        ...up_next_members,
        [id]: [...up_next_members[id].slice(1), up_next_members[id][0]]
      }
    }

    setGame({
      ...game,
      state: tempState,
      up_next: [...game.up_next.slice(index), ...game.up_next.slice(0, index)],
      up_next_members
    });
    setSelectedPins(new Set());
  };

  const handleSkip = () => {
    if (game.skip_is_miss) return handleMiss(); 

    const id = game.up_next[0];

    const tempState = {...game.state};

    let index = 1;
    for (const [i, id] of game.up_next.slice(1).entries()) {
      if (game.state[id].standing === 'playing') {
        index = i + 1;
        break;
      } else if (game.state[id].standing === 'eliminated') {
        tempState[id].eliminated_turns++;
        if (game.elimination_reset_turns && tempState[id].eliminated_turns >= game.elimination_reset_turns) {
          tempState[id].standing = 'playing';
          tempState[id].num_misses = 0;
          tempState[id].eliminated_turns = 0;
        }
      }
    }

    let up_next_members = {...game.up_next_members};
    if (id in game.teams) {
      up_next_members = {
        ...up_next_members,
        [id]: [...up_next_members[id].slice(1), up_next_members[id][0]]
      }
    }

    setGame({
      ...game,
      state: tempState,
      up_next: [...game.up_next.slice(index), ...game.up_next.slice(0, index)],
      up_next_members 
    });
    setSelectedPins(new Set());
  };

  const handleMiss = () => {
    const id = game.up_next[0];
    
    const tempState = {...game.state};
    const num_misses = game.state[id].num_misses + 1;
    let standing: ParticipantStanding = 'playing';
    if (num_misses >= game.elimination_count) {
      standing = 'eliminated';
    }

    tempState[id] = {
      ...tempState[id],
      num_misses,
      standing
    }

    let index = 1;
    for (const [i, id] of game.up_next.slice(1).entries()) {
      if (game.state[id].standing === 'playing') {
        index = i + 1;
        break;
      } else if (game.state[id].standing === 'eliminated') {
        tempState[id].eliminated_turns++;
        if (game.elimination_reset_turns && tempState[id].eliminated_turns >= game.elimination_reset_turns) {
          tempState[id].standing = 'playing';
          tempState[id].num_misses = 0;
          tempState[id].eliminated_turns = 0;
        }
      }
    }

    let up_next_members = {...game.up_next_members};
    if (id in game.teams) {
      up_next_members = {
        ...up_next_members,
        [id]: [...up_next_members[id].slice(1), up_next_members[id][0]]
      }
    }

    if (!gameIsValid(tempState)) {
      setComplateState('default');
      setShowCompleteModal(true);
    }

    setGame({
      ...game,
      state: tempState,
      up_next: [...game.up_next.slice(index), ...game.up_next.slice(0, index)],
      up_next_members
    })
    setSelectedPins(new Set());
  };

  const getPinOutlineColor = (pinNumber: number): string => {
    if (game.use_pin_value) return theme.pinOutline;

    const id = game.up_next[0];
    const score = game.state[id].score;
    if (score === undefined || game.target_score - score > getMaxScore(game)) return 'white';
    return pinNumber === game.target_score - score ? theme.pinWinOutline : theme.pinOutline;
  };

  const rows = [
    [7, 8, 9],
    [5, 11, 12, 6],
    [3, 10, 4],
    [1, 2]
  ]

  return (
    <View
      pointerEvents="box-none"
      style={{
        width: '90%',
        borderRadius: 20,
        backgroundColor: theme.paleComponent,
        padding: 20,
        // height: 310,
        minHeight: 315,
        marginBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {showAddParticipant ? 
        <AddParticipantModal />
      : 
        <>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {rows.map((row, i) => { return (
              <View
                key={i}
                style={{
                  flexDirection: 'row'
                }}
              >
                {row.map((num, j) => { return (
                  <TouchableOpacity
                    key={j}
                    onPress={() => pressPin(num)}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      borderColor: getPinOutlineColor(num),
                      borderWidth: 2,
                      backgroundColor: isPinSelected(num) ? theme.pinSelected : theme.pinNotSelected,
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: 4
                    }}
                    disabled={!gameIsValid(game.state)}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        color: theme.text
                      }}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                )})}
              </View>
            )})}
          </View>
          <TouchableOpacity
            onPress={handleSkip}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
            }}
            disabled={!gameIsValid(game.state)}
          >
            <Feather 
              name="fast-forward" 
              size={24}
              color={theme.staticButton}
            />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 18,
              position: 'absolute',
              bottom: 65,
              right: 5,
              width: 90,
              color: theme.text
            }}
          >
            count: {selectedPins.size === 0 ? 0 : countPins()}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              position: 'absolute',
              bottom: 20,
              right: 20,
            }}
            disabled={selectedPins.size === 0}
          > 
            <Ionicons
              name="checkmark-circle" 
              size={36} 
              color={selectedPins.size > 0 ? theme.submit : theme.disabledButton} 
              disabled={selectedPins.size === 0}
              style={{alignSelf: 'flex-end'}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleMiss}
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
            }}
            disabled={selectedPins.size > 0 || !gameIsValid(game.state)}
          >
            <FontAwesome 
              name="remove" 
              size={28} 
              color={selectedPins.size === 0 ? theme.missButton: theme.disabledButton} 
              disabled={selectedPins.size > 0}
            />
          </TouchableOpacity>
        </>
      }
    </View>
  )
}