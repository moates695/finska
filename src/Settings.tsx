import { View, Text, Button, TextInput, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { useState } from 'react';
import { updateReset, updateTarget } from './settingsSlice';
import NumericInput from './NumericInput';

export default function Settings({ navigation }) {
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  // TODO on back revert to previous settings
  function handleBack() {
    navigation.goBack()
  }

  // TODO on save prevent any settings collisions
  function handleSave() {
    navigation.goBack()
  }

  // TODO warn users of colliding settings, but allow to continue editing if they want (they may remedy before save)

  const targetProps = {
    name: 'target',
    originalValue: settings.target,
    updateFunction: updateTarget,
  }

  const resetProps = {
    name: 'target',
    originalValue: settings.reset,
    updateFunction: updateReset,
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <NumericInput {...targetProps}/>
      <NumericInput {...targetProps}/>

      <Button title="back" onPress={handleBack} />
      <Button title="save" onPress={handleSave} />
    </View>
  )
}