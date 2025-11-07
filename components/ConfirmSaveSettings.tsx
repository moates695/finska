import { gameAtom, showConfirmSaveSettingsAtom, tempGameAtom, themeAtom } from "@/store/general";
import { generalStyles } from "@/styles/general";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";


export default function ConfirmSaveSettings() {
  const setGame = useSetAtom(gameAtom);
  const setShowConfirmSaveSettings = useSetAtom(showConfirmSaveSettingsAtom);
  const [tempGame, setTempGame] = useAtom(tempGameAtom);
  
  const theme = useAtomValue(themeAtom);
  
  const handleCancel = () => {
    setShowConfirmSaveSettings(false);
    setTempGame(null);
  };

  const handleConfirm = () => {
    if (tempGame !== null) {
      setGame(tempGame);
    }
    setShowConfirmSaveSettings(false);
    setTempGame(null);
  };

  return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.modalBackdrop,
          width: '100%',
        }}
      >
        <View
          style={{
            backgroundColor: theme.primaryBackground,
            width: 350,
            padding: 20,
            justifyContent: 'center',
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              textAlign: 'center',
              fontSize: 18,
              paddingBottom: 10,
              color: theme.text
            }}
          >
            Saving will update game state
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-around',
            }}
          >
            <TouchableOpacity
              onPress={handleCancel}
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
                cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
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
                confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
} 