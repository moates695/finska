import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { useSelector } from '@xstate/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { getRemainingScore, getParticipantName, getCurrentMemberName } from '@/store/game_logic';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

interface ParticipantData {
  type: 'player' | 'team';
  name: string;
  memberName?: string;
  score: number;
  misses: number;
}

export default function UpNext({ actor }: Props) {
  const theme = useAtomValue(themeAtom);
  const ctx = useSelector(actor, (s) => s.context);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const getParticipantData = (index: number): ParticipantData | null => {
    const id = ctx.turn_order[index];
    if (!id || !ctx.state[id]) return null;
    const state = ctx.state[id];

    if (id in ctx.players) {
      return {
        type: 'player',
        name: ctx.players[id],
        score: state.score,
        misses: state.misses,
      };
    }

    const team = ctx.teams[id];
    if (!team) return null;
    const memberOrder = ctx.member_order[id];
    const currentMemberId = memberOrder?.[0];

    return {
      type: 'team',
      name: team.name,
      memberName: currentMemberId ? team.members[currentMemberId] : undefined,
      score: state.score,
      misses: state.misses,
    };
  };

  // Find next *playing* participant
  const nextPlayingIndex = useMemo(() => {
    for (let i = 1; i < ctx.turn_order.length; i++) {
      const id = ctx.turn_order[i];
      if (ctx.state[id]?.standing === 'playing') return i;
    }
    return 1;
  }, [ctx.turn_order, ctx.state]);

  const upNow = getParticipantData(0);
  const upNext = getParticipantData(nextPlayingIndex);

  const playingIds = useMemo(
    () => ctx.turn_order.filter((id) => ctx.state[id]?.standing === 'playing'),
    [ctx.turn_order, ctx.state],
  );

  const displayName = (data: ParticipantData): string => {
    if (data.type === 'player') return data.name;
    return `${data.name} → ${data.memberName ?? ''}`;
  };

  useEffect(() => {
    if (isExpanded) scrollViewRef.current?.scrollToEnd({ animated: false });
  }, [isExpanded]);

  // Team member swap
  const currentId = ctx.turn_order[0];
  const isCurrentTeam = currentId in ctx.teams;
  const teamMembers = isCurrentTeam ? ctx.member_order[currentId] ?? [] : [];

  const handleSwapMember = (memberId: string) => {
    actor.send({ type: 'SWAP_MEMBER', teamId: currentId, memberId });
    setShowSwap(false);
  };

  if (!upNow) return null;

  return (
    <View style={{ width: '90%', alignItems: 'center', position: 'relative' }}>
      {/* Expanded turn order overlay */}
      {isExpanded && (
        <View
          style={{
            zIndex: 10,
            position: 'absolute',
            bottom: 80,
            left: 0,
            backgroundColor: theme.brightComponent,
            paddingVertical: 10,
            borderRadius: 10,
            maxHeight: 400,
          }}
        >
          <ScrollView ref={scrollViewRef} style={{ paddingHorizontal: 20 }}>
            {playingIds.slice(2).reverse().map((id, i) => (
              <View
                key={id}
                style={{
                  backgroundColor: i % 2 ? theme.brightComponentSeperate : 'transparent',
                  padding: 4,
                  paddingHorizontal: 10,
                  borderRadius: 4,
                }}
              >
                <Text style={{ color: theme.text }}>
                  {getParticipantName(ctx, id)}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Team member swap popup */}
      {showSwap && isCurrentTeam && (
        <View
          style={{
            zIndex: 20,
            position: 'absolute',
            bottom: 80,
            right: 0,
            backgroundColor: theme.brightComponent,
            padding: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: theme.text, fontWeight: 'bold', marginBottom: 4 }}>
            Swap to:
          </Text>
          {teamMembers.slice(1).map((memberId) => (
            <TouchableOpacity
              key={memberId}
              onPress={() => handleSwapMember(memberId)}
              style={{ padding: 6 }}
            >
              <Text style={{ color: theme.text }}>
                {ctx.teams[currentId].members[memberId]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={{
          backgroundColor: theme.brightComponent,
          width: '100%',
          margin: 10,
          padding: 12,
          borderRadius: 14,
          height: 68,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
          elevation: 2,
        }}
        disabled={playingIds.length <= 2}
      >
        <Grid>
          <Row>
            <Col size={5}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: theme.text }}>
                  Up next: {upNext ? displayName(upNext) : '-'}
                </Text>
                {playingIds.length > 2 && (
                  <MaterialIcons
                    name={isExpanded ? 'expand-more' : 'expand-less'}
                    size={16}
                    color={theme.staticButton}
                    style={{ marginLeft: 5 }}
                  />
                )}
              </View>
            </Col>
            <Col style={{ alignItems: 'center' }}>
              <Text style={{ color: theme.text }}>score</Text>
            </Col>
            <Col style={{ alignItems: 'center' }}>
              <Text style={{ color: theme.text }}>to win</Text>
            </Col>
            <Col style={{ alignItems: 'center' }}>
              <Text style={{ color: theme.text }}>misses</Text>
            </Col>
          </Row>
          <Row>
            <Col size={5}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: theme.text }}>
                  Now: {displayName(upNow)}
                </Text>
                {isCurrentTeam && teamMembers.length > 1 && (
                  <TouchableOpacity
                    onPress={() => setShowSwap(!showSwap)}
                    style={{ marginLeft: 6 }}
                  >
                    <Ionicons name="swap-horizontal" size={18} color={theme.staticButton} />
                  </TouchableOpacity>
                )}
              </View>
            </Col>
            <Col style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 18, color: theme.text }}>{upNow.score}</Text>
            </Col>
            <Col style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 18, color: theme.text }}>
                {getRemainingScore(ctx.rules, upNow.score)}
              </Text>
            </Col>
            <Col style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 18, color: theme.text }}>
                {upNow.misses}/{ctx.rules.elimination_count}
              </Text>
            </Col>
          </Row>
        </Grid>
      </TouchableOpacity>
    </View>
  );
}
