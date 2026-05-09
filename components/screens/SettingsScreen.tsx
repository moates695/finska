import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSelector } from '@xstate/react';
import { useAtom, useAtomValue } from 'jotai';
import { themeTypeAtom, themeAtom, useDeviceThemeAtom } from '@/store/theme';
import { Theme, themes, ThemeType } from '@/styles/theme';
import { initialRules } from '@/store/types';
import Dropdown from '@/components/shared/Dropdown';
import Toggle from '@/components/shared/Toggle';
import RulesInfoModal from '@/components/modals/RulesInfoModal';
import type { gameActor } from '@/App';

interface Props {
  actor: typeof gameActor;
}

export default function SettingsScreen({ actor }: Props) {
  const ctx = useSelector(actor, (s) => s.context);
  const theme = useAtomValue(themeAtom);
  const [themeType, setThemeType] = useAtom(themeTypeAtom);
  const [useDeviceTheme, setUseDeviceTheme] = useAtom(useDeviceThemeAtom);
  const colorScheme = useColorScheme();

  // Local form state initialised from current rules
  const [targetScore, setTargetScore] = useState(ctx.rules.target_score.toString());
  const [resetScore, setResetScore] = useState(ctx.rules.reset_score.toString());
  const [eliminationMissCount, setEliminationMissCount] = useState(
    ctx.rules.elimination_count.toString(),
  );
  const [eliminationResetScore, setEliminationResetScore] = useState(
    ctx.rules.elimination_reset_score.toString(),
  );
  const [eliminationTurns, setEliminationTurns] = useState(
    (ctx.rules.elimination_reset_turns ?? '').toString(),
  );
  const [skipIsMiss, setSkipIsMiss] = useState(ctx.rules.skip_is_miss);
  const [usePinValue, setUsePinValue] = useState(ctx.rules.use_pin_value);
  const [showRulesInfo, setShowRulesInfo] = useState(false);

  // Errors
  const [targetScoreError, setTargetScoreError] = useState<string | null>(null);
  const [resetScoreError, setResetScoreError] = useState<string | null>(null);
  const [elimMissError, setElimMissError] = useState<string | null>(null);
  const [elimResetError, setElimResetError] = useState<string | null>(null);
  const [elimTurnsError, setElimTurnsError] = useState<string | null>(null);

  const styles = createStyles(theme);

  // Cross-field validation
  useEffect(() => {
    const target = parseInt(targetScore) || ctx.rules.target_score;
    const reset = parseInt(resetScore);
    if (!isNaN(reset) && reset >= target) {
      setResetScoreError('Must be less than target');
    } else if (resetScoreError === 'Must be less than target') {
      setResetScoreError(null);
    }

    const elimReset = parseInt(eliminationResetScore);
    if (!isNaN(elimReset) && elimReset >= target) {
      setElimResetError('Must be less than target');
    } else if (elimResetError === 'Must be less than target') {
      setElimResetError(null);
    }
  }, [targetScore, resetScore, eliminationResetScore]);

  const handleChangeScore = (
    text: string,
    setter: (v: string) => void,
    errorSetter: (v: string | null) => void,
    allowEmpty = false,
  ) => {
    setter(text);
    if (!text && allowEmpty) {
      errorSetter(null);
      return;
    }
    const num = parseInt(text);
    if (isNaN(num)) {
      errorSetter('Invalid number');
    } else if (num <= 0 && !allowEmpty) {
      errorSetter('Must be positive');
    } else {
      errorSetter(null);
    }
  };

  const handleChangeReset = (
    text: string,
    setter: (v: string) => void,
    errorSetter: (v: string | null) => void,
  ) => {
    setter(text);
    const num = parseInt(text);
    const target = parseInt(targetScore) || ctx.rules.target_score;
    if (isNaN(num)) {
      errorSetter('Invalid number');
    } else if (num >= target) {
      errorSetter('Must be less than target');
    } else {
      errorSetter(null);
    }
  };

  const hasErrors =
    targetScoreError !== null ||
    resetScoreError !== null ||
    elimMissError !== null ||
    elimResetError !== null ||
    elimTurnsError !== null;

  const handleSave = () => {
    const parseNum = (s: string, fallback: number, allowNeg = false) => {
      const n = parseInt(s);
      if (isNaN(n)) return fallback;
      if (!allowNeg && n < 0) return fallback;
      return n;
    };

    const rules = {
      target_score: parseNum(targetScore, ctx.rules.target_score),
      reset_score: parseNum(resetScore, ctx.rules.reset_score, true),
      elimination_count: parseNum(eliminationMissCount, ctx.rules.elimination_count),
      elimination_reset_score: parseNum(
        eliminationResetScore,
        ctx.rules.elimination_reset_score,
        true,
      ),
      elimination_reset_turns:
        eliminationTurns === ''
          ? null
          : parseNum(eliminationTurns, ctx.rules.elimination_reset_turns ?? 0) || null,
      skip_is_miss: skipIsMiss,
      use_pin_value: usePinValue,
    };

    actor.send({ type: 'UPDATE_RULES', rules });
    actor.send({ type: 'GO_BACK' });
  };

  const handleDefaults = () => {
    setTargetScore(initialRules.target_score.toString());
    setResetScore(initialRules.reset_score.toString());
    setEliminationMissCount(initialRules.elimination_count.toString());
    setEliminationResetScore(initialRules.elimination_reset_score.toString());
    setEliminationTurns('');
    setSkipIsMiss(initialRules.skip_is_miss);
    setUsePinValue(initialRules.use_pin_value);
  };

  const handleUseDeviceTheme = () => {
    if (!useDeviceTheme && colorScheme) {
      const newType: ThemeType = colorScheme === 'dark' ? 'dark' : 'light';
      setThemeType(newType);
    }
    setUseDeviceTheme(!useDeviceTheme);
  };

  const themeOptions = [
    { label: 'light', value: 'light' },
    { label: 'dark', value: 'dark' },
  ];

  const handleSelectTheme = (value: any) => {
    setUseDeviceTheme(false);
    setThemeType(value as ThemeType);
  };

  return (
    <View style={styles.outerContainer}>
      <View style={{ width: '90%' }}>
        {/* Back button */}
        <TouchableOpacity
          onPress={() => actor.send({ type: 'GO_BACK' })}
          style={{ marginBottom: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.staticButton} />
        </TouchableOpacity>

        {/* App settings */}
        <View style={[styles.section, { marginBottom: 10 }]}>
          <Text style={styles.sectionTitle}>App settings:</Text>
          <View style={styles.toggleRow}>
            <Text style={{ color: theme.text }}>Use device theme:</Text>
            <Toggle value={useDeviceTheme} onValueChange={handleUseDeviceTheme} />
          </View>
          <View style={styles.toggleRow}>
            <Text style={{ color: theme.text }}>Choose a theme:</Text>
            <Dropdown
              options={themeOptions}
              selectedValue={themeType}
              setSelectedValue={handleSelectTheme}
            />
          </View>
        </View>

        {/* Game rules */}
        <View style={styles.section}>
          <View style={styles.rulesHeader}>
            <Text style={styles.sectionTitle}>Game rules:</Text>
            <TouchableOpacity
              onPress={() => setShowRulesInfo(true)}
              hitSlop={8}
              accessibilityLabel="Show rule descriptions"
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={theme.staticButton}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={{ color: theme.text }}>Target score:</Text>
              <TextInput
                value={targetScore}
                onChangeText={(t) =>
                  handleChangeScore(t, setTargetScore, setTargetScoreError)
                }
                returnKeyType="done"
                keyboardType="number-pad"
                style={styles.textInput}
              />
              {targetScoreError && (
                <Text style={styles.errorText}>{targetScoreError}</Text>
              )}
            </View>
            <View style={styles.inputCol}>
              <Text style={{ color: theme.text }}>Reset score:</Text>
              <TextInput
                value={resetScore}
                onChangeText={(t) =>
                  handleChangeReset(t, setResetScore, setResetScoreError)
                }
                returnKeyType="done"
                keyboardType="number-pad"
                style={styles.textInput}
              />
              {resetScoreError && (
                <Text style={styles.errorText}>{resetScoreError}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={{ color: theme.text }}>Eliminate after:</Text>
              <TextInput
                value={eliminationMissCount}
                onChangeText={(t) =>
                  handleChangeScore(t, setEliminationMissCount, setElimMissError)
                }
                returnKeyType="done"
                keyboardType="number-pad"
                style={styles.textInput}
              />
              {elimMissError && (
                <Text style={styles.errorText}>{elimMissError}</Text>
              )}
            </View>
            <View style={styles.inputCol}>
              <Text style={{ color: theme.text }}>Eliminate reset:</Text>
              <TextInput
                value={eliminationResetScore}
                onChangeText={(t) =>
                  handleChangeReset(t, setEliminationResetScore, setElimResetError)
                }
                returnKeyType="done"
                keyboardType="number-pad"
                style={styles.textInput}
              />
              {elimResetError && (
                <Text style={styles.errorText}>{elimResetError}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={{ color: theme.text }}>Eliminate turns:</Text>
              <TextInput
                value={eliminationTurns}
                onChangeText={(t) =>
                  handleChangeScore(t, setEliminationTurns, setElimTurnsError, true)
                }
                returnKeyType="done"
                keyboardType="number-pad"
                placeholder="never"
                placeholderTextColor={theme.placeHolderText}
                style={styles.textInput}
              />
              {elimTurnsError && (
                <Text style={styles.errorText}>{elimTurnsError}</Text>
              )}
            </View>
          </View>

          {/* Toggle switches */}
          <View style={styles.switchRow}>
            <View style={styles.toggleRow}>
              <Text style={{ color: theme.text }}>Skip counts as miss:</Text>
              <Toggle value={skipIsMiss} onValueChange={setSkipIsMiss} />
            </View>
            <View style={styles.toggleRow}>
              <Text style={{ color: theme.text }}>Use pin value:</Text>
              <Toggle value={usePinValue} onValueChange={setUsePinValue} />
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.inputRow}>
            <TouchableOpacity onPress={handleDefaults} style={styles.actionButton}>
              <Text style={{ color: theme.text }}>Defaults</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={styles.actionButton}
              disabled={hasErrors}
            >
              <Text style={{ color: hasErrors ? theme.disabledButton : theme.text }}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {showRulesInfo && <RulesInfoModal onClose={() => setShowRulesInfo(false)} />}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    outerContainer: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      backgroundColor: theme.paleComponent,
      padding: 20,
      borderRadius: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Fredoka_600SemiBold',
      letterSpacing: 0.4,
      color: theme.text,
      marginBottom: 4,
    },
    rulesHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 10,
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    inputCol: {
      flexDirection: 'column',
    },
    textInput: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 5,
      width: 100,
      padding: 4,
      height: 40,
      marginRight: 5,
      textAlign: 'center',
      color: theme.text,
    },
    errorText: {
      fontSize: 12,
      color: theme.errorText,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10,
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 6,
      marginBottom: 10,
    },
    actionButton: {
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 24,
    },
  });
