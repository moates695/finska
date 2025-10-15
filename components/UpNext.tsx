import { gameAtom, getDistinctUpNext, ParticipantType } from "@/store/general";
import { get } from "http";
import { useAtom } from "jotai";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Col, Row, Grid } from "react-native-easy-grid";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface ParticipantData {
  type: ParticipantType,
  name: string,
  memberName?: string,
  score: number,
  misses: number
}

// todo: press on component to expand to show complete list upcoming turns (may need scroll)
export default function UpNext() {
  const [game, setGame] = useAtom(gameAtom);

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const distinctUpNext = useMemo(() => {
      return getDistinctUpNext(game);
    }, [game.up_next]);

  const getParticipantData = (index: number): ParticipantData => {
    const up_next_id = game.up_next[index];
    const state = game.state[up_next_id];
    if (up_next_id in game.players) {
      return {
        type: 'player',
        name: game.players[up_next_id],
        score: state.score,
        misses: state.num_misses,
      }
    }

    const team = game.teams[up_next_id];
    return {
      type: 'team',
      name: team.name,
      memberName: team.members[game.up_next_members[up_next_id][0]],
      score: state.score,
      misses: state.num_misses,
    }
  };

  const upNow = getParticipantData(0);
  const upNext = (() => {
    let index = 1;
    for (const [i, id] of game.up_next.slice(1).entries()) {
      if (game.state[id].standing !== 'playing') continue;
      index = i + 1;
      break;
    }
    return getParticipantData(index);
  })();

  const displayName = (details: ParticipantData): string => {
    if (details.type === 'player') {
      return details.name
    }
    return `${details.name} -> ${details.memberName}`;
  };

  const getRemainingScore = (score: number): string => {
    return (game.target_score - score).toString();
  };

  useEffect(() => {
    if (!isExpanded) return;
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }, [isExpanded]);

  // todo add team member order and colours (similar to participant list)
  return (
    <View
      style={{
        width: '90%',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {isExpanded &&
        <View
          style={{
            zIndex: 10,
            position: 'absolute',
            bottom: 80,
            left: 0,
            backgroundColor: 'orange', 
            paddingBottom: 10,
            paddingTop: 10,
            borderRadius: 10,
            width: 'auto',
            maxHeight: 400
          }}
        >
          <ScrollView
            ref={scrollViewRef}
            style={{
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            {distinctUpNext.playing.slice(2).reverse().map((id, i) => {
              return (
                <View
                  key={id}
                  style={{
                    backgroundColor: i % 2 ? '#ffca7aff' : 'transparent',
                    padding: 4,
                    paddingLeft: 10,
                    paddingRight: 10,
                    borderRadius: 4,
                  }}
                >

                    {id in game.players ?
                      <Text>{game.players[id]}</Text>
                    :
                      <View>
                        <View
                          style={{
                            marginLeft: 10,
                          }}
                        >
                          {game.up_next_members[id].reverse().map((memberId) => {
                            return (
                              <View key={memberId}>
                                <Text>{game.teams[id].members[memberId]}</Text>
                              </View>
                            )
                          })}
                        </View>
                        <Text>{game.teams[id].name}</Text>
                      </View>
                    }
                </View>
              )
            })}
          </ScrollView>
        </View>
      }
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={{
          backgroundColor: 'orange',
          width: '100%',
          margin: 10,
          padding: 10,
          borderRadius: 10,
          height: 65
        }}
        disabled={distinctUpNext.playing.length <= 2}
      >
        <Grid>
          <Row>
            <Col size={5}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
              <Text
                style={{
                  fontSize: 14,
                }}
              >
                Up next: {displayName(upNext)}
              </Text>
              {isExpanded ?
                <MaterialIcons 
                  name="expand-more" 
                  size={16}
                  color="black"
                  style={{marginLeft: 5}}
                />
              :
                <MaterialIcons 
                  name="expand-less" 
                  size={16}
                  color="black"
                  style={{marginLeft: 5}}
                />
              }
              
              </View>
            </Col>
            <Col style={{alignItems: 'center'}}>
              <Text
                style={{
                }}
              >
                score
              </Text>
            </Col>
            <Col style={{alignItems: 'center'}}>
              <Text
                style={{
                }}
              >
                to win
              </Text>
            </Col>
            <Col style={{alignItems: 'center'}}>
              <Text
                style={{
                }}
              >
                misses
              </Text>
            </Col>
          </Row>
          <Row>
            <Col size={5}>
              <Text
                style={{
                  fontSize: 20,
                }}
              >Now: {displayName(upNow)}</Text>
            </Col>
            <Col style={{alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: 20,
                }}
              >
                {upNow.score}
              </Text>
            </Col>
            <Col style={{alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: 20,
                }}
              >
                {getRemainingScore(upNow.score)}
              </Text>
            </Col>
            <Col style={{alignItems: 'center'}}>
              <Text
                style={{
                  fontSize: 20,
                }}
              >
                {upNow.misses}/{game.elimination_count}
              </Text>
            </Col>
          </Row>
        </Grid>
      </TouchableOpacity>
    </View>
  )
}