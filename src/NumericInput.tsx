import { useEffect, useState } from "react";
import { Button, Keyboard, Text, TextInput } from "react-native";

interface NumericInputProps {
  setting: string;
  originalValue: number;
  updateFunction: any; 
}

export default function NumericInput(props: NumericInputProps) {
  const { setting, originalValue, updateFunction } = props;

  const [value, setValue] = useState<string>(originalValue.toString());

  useEffect(() => {
    setValue(originalValue.toString());
  }, [originalValue]);

  function checkNum(num: number): boolean {
    return !isNaN(num) && Number.isInteger(num);
  }

  function handleChange(text: string) {
    const filteredText = text.replace(/[^0-9]/g, '');
    setValue(filteredText);
    const num = parseInt(filteredText);
    if (checkNum(num)) {
      updateFunction(num);
    }
  }

  function handleSubmit() {
    const num = parseInt(value);
    if (!checkNum(num)) {
      setValue('');
      return;
    }
    updateFunction(num);
    Keyboard.dismiss();
  }
  
  return (
    <>
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingLeft: 8, width: 150 }}
        placeholder={setting}
        onChangeText={handleChange}
        onSubmitEditing={handleSubmit}
        value={value}
        clearButtonMode="while-editing"
        keyboardType='numeric'
      />
      <Button title={`update ${setting}`} onPress={handleSubmit} />
    </>
   );
}