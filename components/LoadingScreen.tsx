import { themeAtom } from "@/store/general";
import { useAtomValue } from "jotai";
import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface LoadingScreenProps {
  delay?: number
}

export default function LoadingScreen(props: LoadingScreenProps) {
  const { delay } = props;
  const theme = useAtomValue(themeAtom);

  const [show, setShow] = useState<boolean>(delay === undefined);

  if (delay) {
    setTimeout(() => {
      setShow(true);
    }, delay)
  }
  
  return (
    <View 
      style={{
        flex: 1, 
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.primaryBackground
      }}
    >
      {show &&
        <>
          <ActivityIndicator size="large" />
          <Text
            style={{
              color: theme.text
            }}
          >
            Loading...
          </Text>
        </>
      }  
    </View>
  );
}
