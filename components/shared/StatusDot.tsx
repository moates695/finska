import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
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

  const styleMap: Record<ParticipantStanding, ViewStyle> = {
    playing: { backgroundColor: '#4CAF50' },
    paused: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#9E9E9E' },
    eliminated: { backgroundColor: theme.missButton },
  };

  const dot = (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        styleMap[standing],
      ]}
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
