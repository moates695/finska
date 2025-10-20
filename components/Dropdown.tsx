import { themeAtom } from "@/store/general";
import { useAtomValue } from "jotai";
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
  width?: number
  disabled?: boolean
}

export default function Dropdown(props: DropdownProps) {
  const theme = useAtomValue(themeAtom);

  const {
    options,
    selectedValue,
    setSelectedValue,
    width = 150,
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
        backgroundColor: theme.dropdownBackground,
        width: width
      }}
      selectedTextStyle={{
        color: theme.text
      }}
      renderItem={(item, selected) => (
        <View
          style={{
            height: 40,
            paddingLeft: 5,
            paddingRight: 5,
            justifyContent: 'center',
            backgroundColor: selected ? theme.brightComponent : theme.dropdownBackground
          }}
        >
          <Text 
            style={{ 
              color: selected ? theme.dropdownSelectedText : theme.dropdownText 
            }}
          >
            {item.label}
          </Text>
        </View>
      )}
      disable={disabled}
      autoScroll={false}
    />
  )
}