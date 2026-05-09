import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useSelector } from '@xstate/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { countPins, getMaxScore, getCurrentPlayerId } from '@/store/game_logic';
import { isGameValid } from '@/store/validation';
import ParticipantForm from '@/components/shared/ParticipantForm';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
  showAddParticipant: boolean;
}

export default function PinMap({ actor, showAddParticipant }: Props) {
  const theme = useAtomValue(themeAtom);
  const ctx = useSelector(actor, (s) => s.context);
  const [selectedPins, setSelectedPins] = useState<Set<number>>(new Set());

  const gameValid = isGameValid(ctx);

  const pressPin = (num: number) => {
    setSelectedPins((prev) => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  const handleSubmit = () => {
    actor.send({ type: 'SUBMIT_TURN', pins: selectedPins });
    setSelectedPins(new Set());
  };

  const handleSkip = () => {
    actor.send({ type: 'SKIP_TURN' });
    setSelectedPins(new Set());
  };

  const handleMiss = () => {
    actor.send({ type: 'MISS_TURN' });
    setSelectedPins(new Set());
  };

  const getPinOutlineColor = (pinNumber: number): string => {
    if (ctx.rules.use_pin_value) return theme.pinOutline;
    const id = getCurrentPlayerId(ctx);
    const score = ctx.state[id]?.score ?? 0;
    if (ctx.rules.target_score - score > getMaxScore(ctx.rules)) return theme.pinOutline;
    return pinNumber === ctx.rules.target_score - score
      ? theme.pinWinOutline
      : theme.pinOutline;
  };

  const rows = [
    [7, 8, 9],
    [5, 11, 12, 6],
    [3, 10, 4],
    [1, 2],
  ];

  const pinCount = selectedPins.size === 0 ? 0 : countPins(ctx.rules, selectedPins);

  return (
    <View
      pointerEvents="box-none"
      style={{
        width: '90%',
        borderRadius: 18,
        backgroundColor: theme.paleComponent,
        padding: 20,
        minHeight: 315,
        marginBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {showAddParticipant ? (
        <ParticipantForm actor={actor} />
      ) : (
        <>
          {/* Pin grid */}
          <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {rows.map((row, i) => (
              <View key={i} style={{ flexDirection: 'row' }}>
                {row.map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => pressPin(num)}
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      borderColor: getPinOutlineColor(num),
                      borderWidth: 2,
                      backgroundColor: selectedPins.has(num)
                        ? theme.pinSelected
                        : theme.pinNotSelected,
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: 4,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.08,
                      shadowRadius: 2,
                      elevation: 1,
                    }}
                    disabled={!gameValid}
                  >
                    <Text style={{ fontSize: 20, fontWeight: '600', color: theme.text }}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/* Skip button (top right) */}
          <TouchableOpacity
            onPress={handleSkip}
            style={{ position: 'absolute', top: 20, right: 20 }}
            disabled={!gameValid}
          >
            <Feather name="fast-forward" size={24} color={theme.staticButton} />
          </TouchableOpacity>

          {/* Pin count display */}
          <Text
            style={{
              fontSize: 18,
              position: 'absolute',
              bottom: 65,
              right: 5,
              width: 90,
              color: theme.text,
            }}
          >
            score: {pinCount}
          </Text>

          {/* Submit button (bottom right) */}
          <TouchableOpacity
            onPress={handleSubmit}
            style={{ position: 'absolute', bottom: 20, right: 20 }}
            disabled={selectedPins.size === 0}
          >
            <Ionicons
              name="checkmark-circle"
              size={36}
              color={selectedPins.size > 0 ? theme.submit : theme.disabledButton}
              style={{ alignSelf: 'flex-end' }}
            />
          </TouchableOpacity>

          {/* Miss button (top left) */}
          <TouchableOpacity
            onPress={handleMiss}
            style={{ position: 'absolute', top: 20, left: 20 }}
            disabled={selectedPins.size > 0 || !gameValid}
          >
            <FontAwesome
              name="remove"
              size={28}
              color={selectedPins.size === 0 ? theme.missButton : theme.disabledButton}
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
