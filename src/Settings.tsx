import { View, Text, Button, TextInput, Keyboard, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { useState, useEffect } from 'react';
import { updateReset, updateTarget, SitoutType, sitouts, allDefaults } from './settingsSlice';
import NumericInput from './NumericInput';

export default function Settings({ navigation }) {
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  const startSettings = {...settings};

  useEffect(() => {
    //! TODO store start settings so can restore on cancel
  }, [settings]);

  const [selectedOption, setSelectedOption] = useState<SitoutType>('none');
  // TODO responsice props useEffect + useState?

  function handleOptionPress(timeout: SitoutType) {
    setSelectedOption(timeout);
  }

  // TODO on back revert to previous settings
  function handleCancel() {
    dispatch(updateTarget(startSettings.target));
    dispatch(updateReset(startSettings.reset));
    navigation.goBack()
  }

  // TODO on save prevent any settings collisions
  function handleSave() {
    navigation.goBack()
  }

  function handleDefaults() {
    dispatch(allDefaults());
  }

  // TODO warn users of colliding settings, but allow to continue editing if they want (they may remedy before save)

  // TODO default button for different settings

  const targetProps = {
    name: 'target',
    originalValue: settings.target,
    updateFunction: updateTarget,
  }

  const resetProps = {
    name: 'reset',
    originalValue: settings.reset,
    updateFunction: updateReset,
  }

  const sitoutProps = {
    name: 'sitout',
    originalValue: settings.sitout.value,
    updateFunction: updateReset,
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