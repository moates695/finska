import React, { useState } from "react";
import { View, Text, Touchable, TouchableOpacity } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { gameAtom, GameState, getMaxScore } from "@/store/general";
import { useAtom } from "jotai";

// todo handle win, handle game invalidated (eliminations)
export default function PinMap() {
  const [game, setGame] = useAtom(gameAtom);
  
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
      // todo handle win
    } else if (newScore > game.target_score) {
      newScore = game.reset_score;
    }

    const up_next = [...game.up_next.slice(1), game.up_next[0]]
    let up_next_members = {...game.up_next_members};
    if (id in game.teams) {
      up_next_members = {
        ...up_next_members,
        [id]: [...up_next_members[id].slice(1), up_next_members[id][0]]
      }
    }

    setGame({
      ...game,
      state: {
        ...game.state,
        [id]: {
          ...game.state[id],
          score: newScore
        }
      },
      up_next,
      up_next_members 
    });
    setSelectedPins(new Set());
  };

  const handleSkip = () => {
    if (game.skip_is_miss) return handleMiss(); 

    const id = game.up_next[0];

    const up_next = [...game.up_next.slice(1), game.up_next[0]]
    let up_next_members = {...game.up_next_members};
    if (id in game.teams) {
      up_next_members = {
        ...up_next_members,
        [id]: [...up_next_members[id].slice(1), up_next_members[id][0]]
      }
    }

    setGame({
      ...game,
      up_next,
      up_next_members 
    });
    setSelectedPins(new Set());
  };

  const handleMiss = () => {
    const id = game.up_next[0];

    let up_next = [...game.up_next];
    let up_next_members = {...game.up_next_members};
    let is_eliminated = false;
    const num_misses = game.state[id].num_misses + 1;
    if (num_misses >= game.elimination_count) {
      up_next = up_next.slice(1);
      delete up_next_members[id];
      is_eliminated = true;
    } else {
      up_next = [...up_next.slice(1), up_next[0]];
      if (id in game.teams) {
        up_next_members = {
          ...up_next_members,
          [id]: [...up_next_members[id].slice(1), up_next_members[id][0]]
        }
      }
    }
    
    setGame({
      ...game,
      state: {
        ...game.state,
        [id]: {
          ...game.state[id],
          num_misses,
          is_eliminated
        }
      },
      up_next,
      up_next_members
    })
    setSelectedPins(new Set());
  };

  const getPinOutlineColor = (pinNumber: number): string => {
    if (game.use_pin_value) return 'white';

    const id = game.up_next[0];
    const score = game.state[id].score;
    if (score === undefined || game.target_score - score > getMaxScore(game)) return 'white';
    return pinNumber === game.target_score - score ? 'orange' : 'white';
  };

  const rows = [
    [7, 8, 9],
    [5, 11, 12, 6],
    [3, 10, 4],
    [1, 2]
  ]

  return (
    <View
      style={{
        width: '90%',
        borderRadius: 20,
        backgroundColor: "#e2d298ff",
        padding: 20,
        height: 310,
        marginBottom: 10,
      }}
    >
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
                  backgroundColor: isPinSelected(num) ? '#3fec00ff' : '#ffedaaff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 4
                }}
              >
                <Text
                  style={{
                    fontSize: 20
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
      >
        <Feather 
          name="fast-forward" 
          size={24}
          color="black"
        />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 18,
          position: 'absolute',
          bottom: 65,
          right: 5,
          width: 90,
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
          color={selectedPins.size > 0 ? "green": "black"} 
          disabled={selectedPins.size === 0}
          style={{alignSelf: 'flex-end'}}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleMiss}
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
        }}
        disabled={selectedPins.size > 0}
      >
        <FontAwesome 
          name="remove" 
          size={28} 
          color={selectedPins.size === 0 ? "red": "black"} 
          disabled={selectedPins.size > 0}
        />
      </TouchableOpacity>
    </View>
  )
}