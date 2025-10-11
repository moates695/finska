import React, { useState } from "react";
import { View, Text, Touchable, TouchableOpacity } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function PinMap() {
  const [selectedPins, setSelectedPins] = useState<Set<number>>(new Set());

  const pressPin = (number: number) => {
    setSelectedPins(prev => {
      const next = new Set(prev);
      if (next.has(number)) next.delete(number)
      else next.add(number);
      return next;
    })
  };

  const isPinSelected = (number: number): boolean => {
    return selectedPins.has(number);
  };

  const handleSubmit = () => {

  };

  const handleSkip = () => {

  };

  const handleMiss = () => {

  };

  const rows = [
    [7, 8, 9],
    [5, 11, 12, 6],
    [3, 10, 4],
    [1, 2]
  ]

  return (
    <View
      style={{
        width: '90%',
        borderRadius: 20,
        backgroundColor: "#e2d298ff",
        position: 'absolute',
        bottom: 20,
        padding: 20,
      }}
    >
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {rows.map((row, i) => { return (
          <View
            key={i}
            style={{
              flexDirection: 'row'
            }}
          >
            {row.map((num, j) => { return (
              <TouchableOpacity
                key={j}
                onPress={() => pressPin(num)}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  borderColor: 'white',
                  borderWidth: 2,
                  backgroundColor: isPinSelected(num) ? '#3fec00ff' : '#ffedaaff',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 4
                }}
              >
                <Text
                  style={{
                    fontSize: 20
                  }}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            )})}
          </View>
        )})}
      </View>
      <TouchableOpacity
        onPress={handleSkip}
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
        }}
      >
        <Feather 
          name="fast-forward" 
          size={24}
          color="black"
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
        }}
      >
        <Ionicons
          name="checkmark-circle" 
          size={36} 
          color={selectedPins.size > 0 ? "green": "black"} 
          disabled={selectedPins.size === 0}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleMiss}
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
        }}
      >
        <FontAwesome 
          name="remove" 
          size={28} 
          color={selectedPins.size === 0 ? "red": "black"} 
          disabled={selectedPins.size > 0}
        />
      </TouchableOpacity>
    </View>
  )
}