import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Switch, StyleSheet, useColorScheme, Modal } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { gameAtom, initialGame, screenAtom, showConfirmSaveSettingsAtom, themeAtom, useDeviceThemeAtom } from "@/store/general";
import { generalStyles } from "@/styles/general";
import { Theme, themes, ThemeType } from "@/styles/theme";
import Dropdown, { DropdownOption } from "./Dropdown";
import { handleChangeReset, handleChangeScore, handleSaveAtom } from "@/store/actions";
import ConfirmSaveSettings from "./ConfirmSaveSettings";

interface ThemeOption {
  label: string
  value: ThemeType
}

export default function Settings() {
  const [game, setGame] = useAtom(gameAtom);
  const [, setScreen] = useAtom(screenAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const showConfirmSaveSetting = useAtomValue(showConfirmSaveSettingsAtom);

  const [useDeviceTheme, setUseDeviceTheme] = useAtom(useDeviceThemeAtom);

  const [targetScore, setTargetScore] = useState<string>(game.target_score.toString());
  const [resetScore, setResetScore] = useState<string>(game.reset_score.toString());
  const [eliminationMissCount, setEliminationMissCount] = useState<string>(game.elimination_count.toString());
  const [eliminationResetScore, setEliminationResetScore] = useState<string>(game.elimination_reset_score.toString());
  const [eliminationTurns, setEliminationTurns] = useState<string>((game.elimination_reset_turns ?? '').toString());
  const [skipIsMiss, setSkipIsMiss] = useState<boolean>(game.skip_is_miss);
  const [usePinValue, setUsePinValue] = useState<boolean>(game.use_pin_value);

  const [targetScoreError, setTargetScoreError] = useState<string | null>(null);
  const [resetScoreError, setResetScoreError] = useState<string | null>(null);
  const [eliminationMissCountError, setEliminationMissCountError] = useState<string | null>(null);
  const [eliminationResetScoreError, setEliminationRestScoreError] = useState<string | null>(null);
  const [eliminationTurnsError, setEliminationTurnsError] = useState<string | null>(null);

  const handleSave = useSetAtom(handleSaveAtom);

  // const setHandleSave = useSetAtom;

  // const handleSaveClick = () => {
  //   const save = setHandleSave(
  //     handleSaveAtom(
  //       targetScore,
  //       resetScore,
  //       eliminationMissCount,
  //       eliminationResetScore,
  //       eliminationTurns,
  //       skipIsMiss,
  //       usePinValue
  //     )
  //   );
  //   save();
  // };

  const styles = createStyles(theme);
  const colorScheme = useColorScheme();
  
  const handleUseDeviceTheme = () => {
    if (!useDeviceTheme) {
      const themeName = colorScheme ?? 'sand';
      const tempTheme = themes[themeName];
      setTheme(tempTheme);
      setThemeValue(themeName);
    }
    setUseDeviceTheme(!useDeviceTheme);
  };

  const themeOptions: ThemeOption[] = [
    { label: 'light', value: 'light'},
    { label: 'dark', value: 'dark'},
    { label: 'sand', value: 'sand'},
  ]
  const [themeValue, setThemeValue] = useState<ThemeType>(theme.type);

  const handleSelectTheme = (value: any) => {
    setUseDeviceTheme(false);
    setThemeValue(value);
    setTheme(themes[value as ThemeType]);
  };

  const tooBigError = 'reset score too big'
  
  const handleDefaults = () => {
    setTargetScore(initialGame.target_score.toString());
    setResetScore(initialGame.reset_score.toString());
    setEliminationMissCount(initialGame.elimination_count.toString());
    setEliminationResetScore(initialGame.elimination_reset_score.toString());
    setEliminationTurns((initialGame.elimination_reset_turns ?? '').toString());
  };

  

  const disableSave = (): boolean => {
    return targetScoreError !== null || resetScoreError !== null || eliminationMissCountError !== null || eliminationResetScoreError !== null || eliminationTurnsError !== null;
  };
  
  useEffect(() => {
    const tempTarget = parseInt(targetScore) ?? game.target_score;
    const tempReset = parseInt(resetScore) ?? game.reset_score;
    
    if (tempTarget <= tempReset) {
      setResetScoreError(tooBigError);
      return;
    } else if (resetScoreError === tooBigError) {
      setResetScoreError(null);
    }
  }, [targetScore]);

  useEffect(() => {
    const tempTarget = parseInt(targetScore) ?? game.target_score;
    const tempElimReset = parseInt(eliminationResetScore) ?? game.elimination_reset_score;

    if (tempTarget <= tempElimReset) {
      setEliminationRestScoreError(tooBigError);
      return;
    } else if (eliminationResetScoreError === tooBigError) {
      setEliminationRestScoreError(null);
    }
  }, [targetScore]);

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: '90%',
          justifyContent: 'center',
          
        }}
      >
        <TouchableOpacity
          onPress={() => setScreen('game')}
          style={{
            marginBottom: 20
          }}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={theme.staticButton}
          />
        </TouchableOpacity>
        <View
          style={[styles.settingsContainer, {marginBottom: 10}]}
        >
          <Text
            style={{
              fontSize: 18,
              color: theme.text,
            }}
          >
            App settings:
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: theme.text
              }}
            >
              Use device theme:
            </Text>
            <Switch
              value={useDeviceTheme}
              onValueChange={handleUseDeviceTheme}
              trackColor={{true: theme.switchTrackOn, false: theme.switchTrackOff}}
              thumbColor={useDeviceTheme ? theme.switchThumbOn : theme.switchThumbOff}
              ios_backgroundColor={theme.switchIosBackground}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <Text
              style={{
                marginRight: 10,
                color: theme.text,
              }}
            >
              Choose a theme:
            </Text>
            <Dropdown 
              options={themeOptions} 
              selectedValue={themeValue} 
              setSelectedValue={handleSelectTheme} 
            />
          </View>
        </View>
        <View
          style={styles.settingsContainer}
        >
          <Text
            style={{
              fontSize: 18,
              paddingBottom: 10,
              color: theme.text,
            }}
          >
            Game rules:
          </Text>
          <View
            style={styles.inputRow}
          >
            <View
              style={styles.inputContainer}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                Target score:
              </Text>
              <TextInput
                value={targetScore}
                onChangeText={(text) => handleChangeScore(text, setTargetScore, setTargetScoreError)}
                returnKeyType="done"
                keyboardType="number-pad"
                style={{
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 5,
                  width: 100,
                  padding: 4,
                  height: 40,
                  marginRight: 5,
                  textAlign: 'center',
                  color: theme.text
                }}
              >
              </TextInput>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.errorText,
                  opacity: targetScoreError !== null ? 1 : 0,
                }}
              >
                {targetScoreError}
              </Text>
            </View>
            <View
              style={styles.inputContainer}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                Reset score:
              </Text>
              <TextInput
                value={resetScore}
                onChangeText={(text) => handleChangeReset(text, setResetScore, setResetScoreError, targetScore, tooBigError)}
                returnKeyType="done"
                keyboardType="number-pad"
                style={{
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 5,
                  width: 100,
                  padding: 4,
                  height: 40,
                  marginRight: 5,
                  textAlign: 'center',
                  color: theme.text
                }}
              >
              </TextInput>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.errorText,
                  opacity: resetScoreError !== null ? 1 : 0,
                }}
              >
                {resetScoreError}
              </Text>
            </View>
          </View>
          <View
            style={styles.inputRow}
          >
            <View
              style={styles.inputContainer}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                Eliminate after:
              </Text>
              <TextInput
                value={eliminationMissCount}
                onChangeText={(text) => handleChangeScore(text, setEliminationMissCount, setEliminationMissCountError)}
                returnKeyType="done"
                keyboardType="number-pad"
                style={{
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 5,
                  width: 100,
                  padding: 4,
                  height: 40,
                  marginRight: 5,
                  textAlign: 'center',
                  color: theme.text
                }}
              >
              </TextInput>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.errorText,
                  opacity: eliminationMissCountError !== null ? 1 : 0,
                }}
              >
                {eliminationMissCountError}  
              </Text>
            </View>
            <View
              style={styles.inputContainer}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                Eliminate reset:
              </Text>
              <TextInput
                value={eliminationResetScore}
                onChangeText={(text) => handleChangeReset(text, setEliminationResetScore, setEliminationRestScoreError, targetScore, tooBigError)}
                returnKeyType="done"
                keyboardType="number-pad"
                style={{
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 5,
                  width: 100,
                  padding: 4,
                  height: 40,
                  marginRight: 5,
                  textAlign: 'center',
                  color: theme.text
                }}
              >
              </TextInput>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.errorText,
                  opacity: eliminationResetScoreError !== null ? 1 : 0,
                }}
              >
                {eliminationResetScoreError}
              </Text>
            </View>
          </View>
          <View
            style={styles.inputRow}
          >
            <View
              style={[
                styles.inputContainer,
                {
                  marginBottom: -10,
                }              
              ]}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                Eliminate turns:
              </Text>
              <TextInput
                value={eliminationTurns}
                onChangeText={(text) => handleChangeScore(text, setEliminationTurns, setEliminationTurnsError, true)}
                returnKeyType="done"
                keyboardType="number-pad"
                placeholder="never"
                placeholderTextColor={theme.placeHolderText}
                style={{
                  borderColor: theme.border,
                  borderWidth: 1,
                  borderRadius: 5,
                  width: 100,
                  padding: 4,
                  height: 40,
                  marginRight: 5,
                  textAlign: 'center',
                  color: theme.text
                }}
              >
              </TextInput>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.errorText,
                  opacity: eliminationTurnsError !== null ? 1 : 0,
                }}
              >
                {eliminationTurnsError}
              </Text>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-around',
              marginBottom: 10,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                Skip counts as miss:
              </Text>
              <Switch
                value={skipIsMiss}
                onValueChange={() => setSkipIsMiss(!skipIsMiss)}
                trackColor={{true: theme.switchTrackOn, false: theme.switchTrackOff}}
                thumbColor={skipIsMiss ? theme.switchThumbOn : theme.switchThumbOff}
                ios_backgroundColor={theme.switchIosBackground}
              />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                Use pin value:
              </Text>
              <Switch
                value={usePinValue}
                onValueChange={() => setUsePinValue(!usePinValue)}
                trackColor={{true: theme.switchTrackOn, false: theme.switchTrackOff}}
                thumbColor={usePinValue ? theme.switchThumbOn : theme.switchThumbOff}
                ios_backgroundColor={theme.switchIosBackground}
              />
            </View>
          </View>
          <View
            style={styles.inputRow}
          >
            <TouchableOpacity
              onPress={handleDefaults}
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
                defaults
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSave(
                targetScore,
                resetScore,
                eliminationMissCount,
                eliminationResetScore,
                eliminationTurns,
                skipIsMiss,
                usePinValue,
              )}
              style={[
                generalStyles.button,
                generalStyles.bigButton,
                {
                  borderColor: theme.border
                }
              ]}
              disabled={disableSave()}
            >
              <Text
                style={{
                  color: theme.text
                }}
              >
                save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal 
        visible={showConfirmSaveSetting}
        transparent={true}
        onRequestClose={() => {}}
        animationType='fade'
      >
        <ConfirmSaveSettings />
      </Modal>
    </View>
  )
}

const createStyles = (theme: Theme) => StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10
  },
  inputContainer: {
    flexDirection: 'column'
  },
  settingsContainer: {
    backgroundColor: theme.paleComponent,
    padding: 20,
    borderRadius: 20,
  }
})