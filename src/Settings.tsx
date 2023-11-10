import { View, Text, Button, TextInput, Keyboard } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { useState } from 'react';
import { updateTarget } from './settingsSlice';

export default function Settings({ navigation }) {
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  
  const [target, setTarget] = useState<string>(settings.target.toString());
  const [validTarget, setValidTarget] = useState<boolean>(true);

  function handleTargetChange(text: string) {
    const filteredText = text.replace(/[^0-9]/g, '');
    setTarget(filteredText);
  }

  function handleTargetSubmit() {
    const num = parseInt(target);
    if (isNaN(num) || !Number.isInteger(num)) {
      setTarget(settings.target.toString());
      return;
    }
    dispatch(updateTarget(num));
    Keyboard.dismiss();
  }

  // TODO on back revert to previous settings
  function handleBack() {
    navigation.goBack()
  }

  // TODO on save prevent any settings collisions
  function handleSave() {
    navigation.goBack()
  }

  // TODO warn users of colliding settings, but allow to continue editing if they want (they may remedy before save)

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Settings Screen</Text>
      <Text>Target</Text>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8, width: 150 }}
        placeholder={target}
        onChangeText={handleTargetChange}
        onSubmitEditing={handleTargetSubmit}
        value={target}
        clearButtonMode="while-editing"
        keyboardType='numeric'
      />
      <Button title="update target" onPress={handleTargetSubmit} />

      <Button title="back" onPress={handleBack} />
      <Button title="save" onPress={handleSave} />
    </View>
  )
}