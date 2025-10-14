import { gameAtom, getMaxScore } from "@/store/general";
import { useAtom } from "jotai";
import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { Col, Row, Grid } from "react-native-easy-grid";

export default function Scoreboard() {
  const [game, setGame] = useAtom(gameAtom);
  
  // console.log(game);

  const getName = (id: string): string => {
    if (id in game.players) {
      return game.players[id];
    }
    return game.teams[id].name;
  };

  // todo reduce duplicate function
  const getRemainingScore = (score: number): string => {
    return (game.target_score - score).toString();
  };

  const sortedParticipants = useMemo(() => {
    const sorted = Object.entries(game.state).map(([id, data]) => {
      return {
        ...data,
        id,
        name: getName(id),
        is_first_eliminated: false,
        last_can_win: false,
      }
    });
    
    sorted.sort((a, b) => {
      if (a.is_eliminated && !b.is_eliminated) {
        return -1;
      } else if (!a.is_eliminated && b.is_eliminated) {
        return 1;
      }

      if (a.score === b.score) {
        return a.name.localeCompare(b.name);
      }
      return a.score - b.score;
    }).reverse();

    const maxScore = getMaxScore(game);
    for (let i = 0; i < sorted.length - 1; i++) {
      const currInRange = sorted[i].score >= game.target_score - maxScore;
      const nextInRange = sorted[i + 1].score >= game.target_score - maxScore;
      if (currInRange && !nextInRange && !sorted[i + 1].is_eliminated) {
        sorted[i].last_can_win = true;
      }
    }

    for (let i = 1; i < sorted.length; i++) {
      if (!sorted[i - 1].is_eliminated && sorted[i].is_eliminated) {
        sorted[i].is_first_eliminated = true;
        break;
      } 
    }

    return sorted;
  }, [game.state]);

  return (
    <View
      style={{
        flex: 1,
        width: '90%',
        height: '100%',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
      }}
    >
      <View
        style={{
          backgroundColor: '#e2d298ff',
          padding: 10,
          borderRadius: 10,
          paddingBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 30,
          }}
        >
          <View />
          <View
            style={{
              flexDirection: 'row',
              padding: 4,
            }}
          >
            <Text
              style={{
                width: 45,
                textAlign: 'center',
              }}
            >
              score
            </Text>
            <Text
              style={{
                width: 45,
                textAlign: 'center',
              }}
            >
              to win
            </Text>
            <Text
              style={{
                width: 45,
                textAlign: 'center',
              }}
            >
              misses
            </Text>
          </View>
        </View>
        <ScrollView>
          {sortedParticipants.map((data, i) => {
            return (
              <React.Fragment key={data.id}>
                {data.is_first_eliminated &&
                  <View 
                    style={{
                      height: 2,
                      backgroundColor: 'red',
                      borderRadius: 1, 
                      marginBottom: 5,
                    }}
                  />
                }
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: 40,
                    backgroundColor: i % 2 ? '#9afaff7a' : '#9affbf7a',
                    borderRadius: 10,
                    padding: 4,
                    marginBottom: 5,
                    borderColor: data.id === game.up_next[0] ? 'white' : 'transparent',
                    borderWidth: 2,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontSize: 20,
                        paddingLeft: 5,
                      }}
                    >
                      {getName(data.id)}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                    }}
                  >
                    <Text
                      style={{
                        width: 45,
                        textAlign: 'center',
                        fontSize: 20,
                      }}
                    >
                      {data.score}
                    </Text>
                    <Text
                      style={{
                        width: 45,
                        textAlign: 'center',
                        fontSize: 20,
                      }}
                    >
                      {getRemainingScore(data.score)}
                    </Text>
                    <Text
                      style={{
                        width: 45,
                        textAlign: 'center',
                        fontSize: 20,
                        color: data.is_eliminated ? 'red' : 'black'
                      }}
                    >
                      {data.num_misses}/{game.elimination_count}
                    </Text>
                  </View>
                </View>
                {data.last_can_win &&
                  <View 
                    style={{
                      height: 2,
                      backgroundColor: 'white',
                      borderRadius: 1, 
                      marginBottom: 5,
                    }}
                  />
                }
              </React.Fragment>
            )
          })}
        </ScrollView>
      </View>
    </View>
  )
}