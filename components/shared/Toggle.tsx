import React from 'react';
import SwitchToggle from 'react-native-switch-toggle';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/store/theme';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export default function Toggle({ value, onValueChange }: Props) {
  const theme = useAtomValue(themeAtom);
  return (
    <SwitchToggle
      switchOn={value}
      onPress={() => onValueChange(!value)}
      backgroundColorOn={theme.switchTrackOn}
      backgroundColorOff={theme.switchTrackOff}
      circleColorOn={theme.switchThumbOn}
      circleColorOff={theme.switchThumbOff}
      duration={200}
      containerStyle={{
        width: 42,
        height: 26,
        borderRadius: 13,
        padding: 3,
      }}
      circleStyle={{
        width: 20,
        height: 20,
        borderRadius: 10,
      }}
    />
  );
}
