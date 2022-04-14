import * as React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle,  } from 'react-native';

import { TextBold } from './Typography';

const style = StyleSheet.create({
  mainContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderRadius: 5,
    borderWidth: 2,
    overflow: 'hidden',
    marginBottom: 5,
  },
  buttonContainer: {
    padding: 5,
  },
  buttonText: {
    color: 'white',
  },
});

export const ButtonGroup = (props: {
  buttons: string[];
  selectedButton: number;
  color: string;
  onPress: (index: number) => void;
  containerStyle?: ViewStyle;
}) => {
  return (
    <View style={[style.mainContainer, props.containerStyle, { borderColor: props.color }]}>
      {props.buttons.map((button, index) => (
        <TouchableOpacity
          onPress={() => props.onPress(index)}
          style={[style.buttonContainer, (index === props.selectedButton) && { backgroundColor: props.color }]}
        >
          <TextBold style={[style.buttonText, (index !== props.selectedButton) && { color: props.color }]}>{button}</TextBold>
        </TouchableOpacity>
      ))}
    </View>
  )
};
