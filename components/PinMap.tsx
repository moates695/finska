import React, { useState } from "react";
import { View, Text, Touchable, TouchableOpacity } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { gameAtom, GameState, Turn } from "@/store/general";
import { useAtom } from "jotai";

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

  const countScore = (): number => {
    if (selectedPins.size === 1) {
      return [...selectedPins][0];
    }
    return selectedPins.size;
  };

  const handleSubmit = () => {
    const gameState = game.state.at(-1)!;
    const id = gameState.up_next[0];
    let participantId = id;
    if (id in game.teams) {
      participantId = gameState.up_next_members[id][0];
    }

    const score = countScore();
    let newScore = score + game.state.at(-1)!.participants[id].score;
    if (newScore > game.target_score) {
      newScore = game.reset_score;
    }

    const nextState = {...game.state.at(-1)!};
    nextState.participants[id].score = newScore;
    updateUpNext(nextState, id === participantId, id);

    const turn: Turn = {
      id: participantId,
      type: 'score',
      score: score
    }

    setGame({
      ...game,
      state: [...game.state, nextState],
      turns: [...game.turns, turn]
    });
    setSelectedPins(new Set());
  };

  const handleSkip = () => {
    const gameState = game.state.at(-1)!;
    const id = gameState.up_next[0];
    let participantId = id;
    if (id in game.teams) {
      participantId = gameState.up_next_members[id][0];
    }

    const nextState = {...game.state.at(-1)!};
    updateUpNext(nextState, id === participantId, id);

    const turn: Turn = {
      id: participantId,
      type: 'skip',
    }

    setGame({
      ...game,
      state: [...game.state, nextState],
      turns: [...game.turns, turn]
    });
    setSelectedPins(new Set());
  };

  const handleMiss = () => {
    const gameState = game.state.at(-1)!;
    const id = gameState.up_next[0];
    let participantId = id;
    if (id in game.teams) {
      participantId = gameState.up_next_members[id][0];
    }

    const nextState = {...game.state.at(-1)!};
    const participantState = nextState.participants[id];
    participantState.num_misses = participantState.num_misses + 1;
    if (participantState.num_misses >= game.elimination_count) {
      participantState.is_eliminated = true;
    }
    updateUpNext(nextState, id === participantId, id);

    const turn: Turn = {
      id: participantId,
      type: 'miss',
    }

    setGame({
      ...game,
      state: [...game.state, nextState],
      turns: [...game.turns, turn]
    });
    setSelectedPins(new Set());
  };

  const updateUpNext = (nextState: GameState, isPlayer: boolean, teamId?: string) => {
    nextState.up_next = [...nextState.up_next.slice(1), nextState.up_next.slice(0, 1)[0]];
    if (!isPlayer) {
      const upNextMembers = nextState.up_next_members[teamId!];
      nextState.up_next_members[teamId!] = [...upNextMembers.slice(1), upNextMembers.slice(0, 1)[0]];
    }
  };

  const getPinOutlineColor = (pinNumber: number): string => {
    const id = game.state.at(-1)!.up_next[0];
    const score = game.state.at(-1)?.participants[id].score;
    if (score === undefined || game.target_score - score > 12) return 'white';
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
          right: 10,
          width: 90,
        }}
      >
        Score: {selectedPins.size === 0 ? 'miss' : countScore()}
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