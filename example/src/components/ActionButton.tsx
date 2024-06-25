import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';

interface IActionButtonProps {
  onPress(): void;
  labelButton: string;
  buttonStyle?: object;
}

const ActionButton = (props: IActionButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={props.onPress}
      style={[styles.button, props.buttonStyle]}
    >
      <Text style={[styles.label]}>{props.labelButton}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '60%',
    height: 40,
    backgroundColor: 'blue',
    borderRadius: 14,
  },
  label: {
    fontSize: 14,
    lineHeight: 21,
    color: 'white',
  },
});

export default ActionButton;
