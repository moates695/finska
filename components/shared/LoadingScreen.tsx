import { themeAtom } from '@/store/theme';
import { useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingScreenProps {
  delay?: number;
}

export default function LoadingScreen({ delay }: LoadingScreenProps) {
  const theme = useAtomValue(themeAtom);
  const [show, setShow] = useState<boolean>(delay === undefined);

  useEffect(() => {
    if (delay === undefined) return;
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.primaryBackground,
      }}
    >
      {show && (
        <>
          <ActivityIndicator size="large" />
          <Text style={{ color: theme.text }}>Loading...</Text>
        </>
      )}
    </View>
  );
}
