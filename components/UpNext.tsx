import { gameAtom, ParticipantType } from "@/store/general";
import { get } from "http";
import { useAtom } from "jotai";
import React from "react";
import { View, Text } from "react-native";
import { Col, Row, Grid } from "react-native-easy-grid";

interface ParticipantName {
  type: ParticipantType,
  name: string,
  memberName?: string,
  score: number,
  misses: number
}

export default function UpNext() {
  const [game, setGame] = useAtom(gameAtom);

  const getParticipantName = (index: number): ParticipantName => {
    const gameState = game.state.at(-1)!
    if (index >= gameState.up_next.length) {
      console.log('index outside of array');
      return {
        type: 'player',
        name: '',
        score: 0,
        misses: 0,
      };
    }
    const up_next_id = gameState.up_next[index];
    if (up_next_id in game.players) {
      const state = game.state.at(-1)?.participants[up_next_id];
      return {
        type: 'player',
        name: game.players[up_next_id],
        score: state?.score || 0,
        misses: state?.num_misses || 0,
      }
    }
    const team = game.teams[up_next_id];
    const state = game.state.at(-1)?.participants[up_next_id];
    return {
      type: 'team',
      name: team.name,
      memberName: team.members[gameState.up_next_members[up_next_id][0]],
      score: state?.score || 0,
      misses: state?.num_misses || 0
    }
  };

  const upNow = getParticipantName(0);
  const upNext = getParticipantName(1);

  const displayName = (details: ParticipantName): string => {
    if (details.type === 'player') {
      return details.name
    }
    return `${details.name}: ${details.memberName}`;
  };

  const getRemainingScore = (score: number): string => {
    if (game.target_score - score > 12) {
      return '??';
    }
    return (game.target_score - score).toString();
  };

  return (
    <View
      style={{
        backgroundColor: 'orange',
        width: '90%',
        margin: 10,
        padding: 10,
        borderRadius: 10,
      }}
    >
      <Grid>
        <Row>
          <Col size={5}>
            <Text
              style={{
                fontSize: 14,
              }}
            >
              Up next: {displayName(upNext)}
            </Text>
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
    </View>
  )
}