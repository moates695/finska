import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { useState, useEffect } from 'react';
import { SitoutType, sitouts, SettingsState, updateAll, Sitout, initialState, scoreTypes, ScoreType } from './settingsSlice';
import NumericInput from './NumericInput';
import ToggleButton from './ToggleButton';

export default function Settings({ navigation }: any) {
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const [newSettings, setNewSettings] = useState<SettingsState>(settings);
  const [selectedOption, setSelectedOption] = useState<SitoutType>(settings.sitout.type);
  const [props, setProps] = useState<{[key: string]: any}>(buildProps);
  const [collidingSettings, setCollidingSettings] = useState<boolean>(false);

  function handleOptionPress(sitout: SitoutType) {
    setSelectedOption(sitout);
  }

  useEffect(() => {
    let value: number = Infinity;
    value = selectedOption === settings.sitout.type ? settings.sitout.value : 3;
    setNewSettings({...newSettings, sitout: {type: selectedOption, value: value}});
  }, [selectedOption]);

  function handleCancel() {
    navigation.goBack()
  }

  function handleSave() {
    if (collidingSettings) return;
    dispatch(updateAll(newSettings));
    navigation.goBack()
  }

  function handleDefaults() {
    setNewSettings(initialState);
    setSelectedOption(initialState.sitout.type);
  }

  function buildProps() {
    let temp: {[key: string]: any} = {};
    for (const key of Object.keys(initialState)) {
      if (key == 'sitout') {
        temp[key] = {
          initialValue: newSettings.sitout.value,
          updateFunction: (newValue: number) => { setNewSettings({...newSettings, sitout: {type: selectedOption, value: newValue}})},
        }
      } else {
        temp[key] = {
          initialValue: newSettings[key as keyof SettingsState],
          updateFunction: (newValue: number) => { setNewSettings({...newSettings, [key]: newValue})},
        }
      }
    }
    return temp;
  }

  useEffect(() => {
    setProps(buildProps);
    setCollidingSettings(newSettings.reset >= newSettings.target);
  }, [newSettings]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {collidingSettings && <Text style={{color: 'red'}}>Settings are colliding!</Text>}
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
      <ToggleButton value1={scoreTypes[1]} value2={scoreTypes[0]} initialValue={settings.scoreType === scoreTypes[0]} 
        updateFunction={(toggle: boolean) => {
          setNewSettings({...newSettings, scoreType: toggle ? scoreTypes[0] : scoreTypes[1]});
        }}/>
      <ToggleButton value1='no' value2='yes' initialValue={settings.skipAsStrike} 
        updateFunction={(toggle: boolean) => {
          setNewSettings({...newSettings, skipAsStrike: toggle});
        }}/>
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