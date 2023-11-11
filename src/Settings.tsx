import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { useState, useEffect } from 'react';
import { SitoutType, sitouts, SettingsState, updateAll, Sitout, initialState } from './settingsSlice';
import NumericInput from './NumericInput';

export default function Settings({ navigation }: any) {
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();
  
  const [newSettings, setNewSettings] = useState<SettingsState>(settings);
  const [selectedOption, setSelectedOption] = useState<SitoutType>('none');
  const [originals, setOriginals] = useState<SettingsState>(settings); // TODO investigate if this is redundant
  const [props, setProps] = useState<{[key: string]: any}>(buildProps);
  const [collidingSettings, setCollidingSettings] = useState<string[]>([]);

  function handleOptionPress(timeout: SitoutType) {
    setSelectedOption(timeout);
    // TODO sitout shit next
    if (timeout === 'none') {
      setNewSettings({...newSettings, sitout: {type: 'none', value: Infinity}});
      return;
    } else {
      setNewSettings({...newSettings, sitout: {type: timeout, value: 1}});
    }
  }

  function handleCancel() {
    navigation.goBack()
  }

  function handleSave() {
    dispatch(updateAll(newSettings));
    navigation.goBack()
  }

  function handleDefaults() {
    setNewSettings(initialState);
  }

  // TODO warn users of colliding settings, but allow to continue editing if they want (they may remedy before save)

  // TODO default button for different settings

  function buildProps() {
    let temp: {[key: string]: any} = {};
    for (const key of Object.keys(initialState)) {
      const original = key !== 'sitout' ? originals[key as keyof SettingsState]: originals.sitout.value;
      temp[key] = {
        setting: key,
        originalValue: original,
        updateFunction: (newValue: number) => { setNewSettings({...newSettings, [key]: newValue})},
      }
    }
    return temp;
  }

  useEffect(() => {
    setOriginals(newSettings);
  }, [newSettings])

  useEffect(() => {
    setProps(buildProps);
  }, [originals]);


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <NumericInput {...props.target}/>
      <NumericInput {...props.reset}/>
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
       {selectedOption !== 'none' && <NumericInput {...props.sitout}/>}
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
    backgroundColor: '#b3e0ff',
  },
  optionText: {
    textAlign: 'center',
  },
})