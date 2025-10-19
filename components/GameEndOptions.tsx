import { themeAtom } from "@/store/general";
import { generalStyles } from "@/styles/general";
import { useAtomValue } from "jotai";
import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface SideMapDataBase {
  buttonText: string,
  buttonPress: () => void
  hasConfirm: boolean
}

interface SideMapDataNoConfirm extends SideMapDataBase {
  hasConfirm: false
}

interface SideMapDataConfirm extends SideMapDataBase {
  hasConfirm: true
  confirmMessage: string
}

type SideMapData = SideMapDataNoConfirm | SideMapDataConfirm;

type Side = 'left' | 'right';

export interface GameEndOptionsProps {
  message: string
  map: Record<Side, SideMapData>
}

export default function GameEndOptions(props: GameEndOptionsProps) {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [side, setSide] = useState<Side | null>(null);  
  const theme = useAtomValue(themeAtom);

  const handleButtonPress = (side: Side) => {
    const data = props.map[side];
    if (data.hasConfirm) {
      setSide(side);
      setShowConfirm(true);
      return;
    }
    data.buttonPress();
  };

  const getConfirmMessage = (): string => {
    if (side === null || !props.map[side].hasConfirm) return '';
    return props.map[side].confirmMessage;
  };

  const confirmPress = () => {
    if (side === null) return;
    return props.map[side].buttonPress();
  };

  return (
    <>
      {showConfirm ?
        <>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              paddingBottom: 10,
              color: theme.text
            }}
          >
            {getConfirmMessage()}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <TouchableOpacity
              onPress={() => setShowConfirm(false)}
              style={[
                generalStyles.button,
                generalStyles.bigButton,
                {
                  borderColor: theme.border
                }
              ]}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                back
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmPress}
              style={[
                generalStyles.button,
                generalStyles.bigButton,
                {
                  borderColor: theme.border
                }
              ]}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                yes
              </Text>
            </TouchableOpacity>
          </View>
        </>
      :
        <>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 20,
              paddingBottom: 10,
              color: theme.text,
            }}
          >
            {props.message}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <TouchableOpacity
              onPress={() => handleButtonPress('left')}
              style={[
                generalStyles.button,
                generalStyles.bigButton,
                {
                  borderColor: theme.border
                }
              ]}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                {props.map.left.buttonText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleButtonPress('right')}
              style={[
                generalStyles.button,
                generalStyles.bigButton,
                {
                  borderColor: theme.border
                }
              ]}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                {props.map.right.buttonText}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      }
    </>
  )
}