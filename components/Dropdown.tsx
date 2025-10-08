import React from "react";
import { View, Text } from "react-native";
import { Dropdown as DropdownComponent } from 'react-native-element-dropdown';

export interface DropdownOption {
  label: string
  value: string | number
}

export interface DropdownProps {
  options: DropdownOption[],
  selectedValue: string | number
  setSelectedValue: (value: any) => void
  disabled?: boolean
}

export default function Dropdown(props: DropdownProps) {
  const {
    options,
    selectedValue,
    setSelectedValue,
    disabled = false
  } = props;

  return (
    <DropdownComponent 
      data={options}
      value={selectedValue}
      labelField={"label"}
      valueField={"value"}
      onChange={(item) => setSelectedValue(item.value)}
      style={{
        height: 40,
        borderRadius: 5,
        paddingLeft: 5,
        paddingRight: 5,
        backgroundColor: '#ffffff'
      }}
      selectedTextStyle={{}}
      renderItem={(item, selected) => (
        <View
          style={{
            height: 40,
            paddingLeft: 5,
            paddingRight: 5,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: selected ? 'green' : 'black' }}>{item.label}</Text>
        </View>
      )}
      disable={disabled}
      autoScroll={false}
    />
  )
}