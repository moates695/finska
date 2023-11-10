import { View, Text, Button, TextInput, Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { useState, useEffect } from 'react';
import { SitoutType, sitouts, SettingsState, updateAll, Sitout } from './settingsSlice';
import NumericInput from './NumericInput';

export default function Settings({ navigation }: any) {
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  
  const [newSettings, setNewSettings] = useState<SettingsState>(settings);
  const [selectedOption, setSelectedOption] = useState<SitoutType>('none');
  const [targetProps, setTargetProps] = useState({
    setting: 'target',
    originalValue: settings.target,
    updateFunction: (newTarget: number) => { setNewSettings({...newSettings, target: newTarget})},
  });

  function handleOptionPress(timeout: SitoutType) {
    setSelectedOption(timeout);
  }

  function handleCancel() {
    navigation.goBack()
  }

  // TODO on save prevent any settings collisions
  function handleSave() {
    dispatch(updateAll(newSettings));
    navigation.goBack()
  }

  function handleDefaults() {
    setNewSettings(settings);
  }

  // TODO warn users of colliding settings, but allow to continue editing if they want (they may remedy before save)

  // TODO default button for different settings
  
  useEffect(() => {
    setTargetProps({
      setting: 'target',
      originalValue: newSettings.target,
      updateFunction: (newTarget: number) => { setNewSettings({...newSettings, target: newTarget})}
    })
  }, [newSettings.target])

  const resetProps = {
    setting: 'reset',
    originalValue: settings.reset,
    updateFunction: (newReset: number) => { setNewSettings({...newSettings, reset: newReset})},
  }

  const sitoutProps = {
    setting: 'sitout',
    originalValue: settings.sitout.value,
    updateFunction: (newValue: Sitout) => { setNewSettings({...newSettings, sitout: newValue})},
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <NumericInput {...targetProps}/>
      <NumericInput {...resetProps}/>
      <View style={styles.container}>
        {sitouts.map((sitout) => {
          return (
            <TouchableOpacity
              key={`${sitout}button`}
              style={[styles.option, selectedOption === sitout && styles.selectedOption]}
              onPress={() => handleOptionPress(sitout)}
            >
              <Text style={styles.optionText}>{sitout}</Text>
            </TouchableOpacity>
          )
        })}
       </View>
       {selectedOption !== 'none' && <NumericInput {...sitoutProps}/>}
      <Button title="cancel" onPress={handleCancel} />
      <Button title="save" onPress={handleSave} />
      <Button title="reset defaults" onPress={handleDefaults} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  option: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  selectedOption: {
    backgroundColor: '#b3e0ff', // Change the color for the selected option
  },
  optionText: {
    textAlign: 'center',
  },
})