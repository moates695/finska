import { useEffect, useState } from "react";
import { Button, Keyboard, Text, TextInput } from "react-native";

interface NumericInputProps {
  name: string;
  originalValue: number;
  updateFunction: any; 
}

export default function NumericInput(props: NumericInputProps) {
  const { name, originalValue, updateFunction } = props;

  const [value, setValue] = useState<string>(originalValue.toString());

  useEffect(() => {
    setValue(originalValue.toString());
  }, [originalValue]);

  function handleChange(text: string) {
    const filteredText = text.replace(/[^0-9]/g, '');
    setValue(filteredText);
  }

  function handleSubmit() {
    const num = parseInt(value);
    if (isNaN(num) || !Number.isInteger(num)) {
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
        placeholder={name}
        onChangeText={handleChange}
        onSubmitEditing={handleSubmit}
        value={value}
        clearButtonMode="while-editing"
        keyboardType='numeric'
      />
      <Button title={`update ${name}`} onPress={handleSubmit} />
    </>
   );
}