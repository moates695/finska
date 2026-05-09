import React, { useState } from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector } from '@xstate/react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import Scoreboard from '@/components/game/Scoreboard';
import UpNext from '@/components/game/UpNext';
import PinMap from '@/components/game/PinMap';
import GameEndModal from '@/components/modals/GameEndModal';
import ConfirmModal from '@/components/modals/ConfirmModal';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

export default function PlayScreen({ actor }: Props) {
  const theme = useAtomValue(themeAtom);
  const isWon = useSelector(actor, (s) => s.matches({ playing: 'won' }));
  const isGameOver = useSelector(actor, (s) => s.matches({ playing: 'gameOver' }));
  const isFinishing = useSelector(actor, (s) => s.matches({ playing: 'finishing' }));

  const [showAddParticipant, setShowAddParticipant] = useState(false);

  return (
    <View style={{ flex: 1, alignItems: 'center', width: '100%' }}>
      <Scoreboard actor={actor} />
      <UpNext actor={actor} />
      <PinMap actor={actor} showAddParticipant={showAddParticipant} />

      {/* Toolbar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '90%',
          marginBottom: 5,
          paddingLeft: 20,
          paddingRight: 25,
        }}
      >
        <TouchableOpacity onPress={() => actor.send({ type: 'OPEN_SETTINGS' })}>
          <Ionicons name="settings-outline" size={24} color={theme.staticButton} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => actor.send({ type: 'FINISH_GAME' })}>
          <Ionicons name="save-outline" size={24} color={theme.staticButton} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowAddParticipant(!showAddParticipant)}>
          <Ionicons
            name={showAddParticipant ? 'person-add' : 'person-add-outline'}
            size={24}
            color={showAddParticipant ? theme.submit : theme.staticButton}
          />
        </TouchableOpacity>
      </View>

      {/* Modals driven by machine sub-states */}
      <Modal
        visible={isWon || isGameOver}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => {}}
        animationType="fade"
      >
        <GameEndModal actor={actor} />
      </Modal>
      <Modal
        visible={isFinishing}
        transparent
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => {}}
        animationType="fade"
      >
        <ConfirmModal actor={actor} />
      </Modal>
    </View>
  );
}
