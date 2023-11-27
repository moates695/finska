import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface ToggleButtonProps {
  value1: string,
  value2: string,
  initialValue: boolean,
  updateFunction: any,
}

export default function ToggleButton (props: ToggleButtonProps) {
  const { value1, value2, initialValue, updateFunction } = props;
  
  const [isToggleOn, setToggleOn] = useState<boolean>(initialValue);

  const toggleAnimation = useRef(new Animated.Value(0)).current;

  function moveToggle() {
    Animated.spring(toggleAnimation, {
      toValue: isToggleOn ? 1 : 0,
      useNativeDriver: false,
    }).start();
  }

  const handleToggle = () => {
    setToggleOn(!isToggleOn);
  };

  useEffect(() => {
    moveToggle();
    updateFunction(isToggleOn);
  }, [isToggleOn]);

  const translateX = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 60], // Adjust the distance as needed
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleToggle} style={styles.button}>
        <Animated.View style={[styles.slider, { transform: [{ translateX }] }]} />
        <View style={styles.textContainer}>
          <Text style={[styles.text, !isToggleOn && styles.activeText]}>{value1}</Text>
          <Text style={[styles.text, isToggleOn && styles.activeText]}>{value2}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: 'relative',
  },
  slider: {
    width: 60,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'blue', // Adjust the color as needed
    position: 'absolute',
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 80,
  },
  text: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeText: {
    color: 'white',
  },
});