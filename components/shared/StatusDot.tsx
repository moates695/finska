import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';
import { ParticipantStanding } from '@/store/types';

interface Props {
  standing: ParticipantStanding;
  editable?: boolean;
  onPress?: () => void;
  size?: number;
}

export default function StatusDot({
  standing,
  editable = false,
  onPress,
  size = 10,
}: Props) {
  const theme = useAtomValue(themeAtom);

  const colorMap: Record<ParticipantStanding, string> = {
    playing: '#4CAF50',
    paused: '#9E9E9E',
    eliminated: theme.missButton,
  };

  const dot = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colorMap[standing],
      }}
    />
  );

  if (editable && onPress) {
    return (
      <TouchableOpacity onPress={onPress} hitSlop={8}>
        {dot}
      </TouchableOpacity>
    );
  }

  return dot;
}
