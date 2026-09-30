import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import React from 'react';

interface IActionButtonProps {
  onPress(): void;
  labelButton: string;
  buttonStyle?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary';
}

const ActionButton = (props: IActionButtonProps) => {
  const secondary = props.variant === 'secondary';
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.75}
      onPress={props.onPress}
      style={[
        styles.button,
        secondary && styles.secondaryButton,
        props.buttonStyle,
      ]}
    >
      <Text style={[styles.label, secondary && styles.secondaryLabel]}>
        {props.labelButton}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 6,
    backgroundColor: '#2563EB',
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 10,
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#334155',
  },
});

export default ActionButton;
