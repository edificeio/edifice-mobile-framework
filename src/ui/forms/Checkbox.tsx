import style from 'glamorous-native';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { CommonStyles } from '~/styles/common/styles';
import { Icon } from '~/ui';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

const TapCircle = style(TouchableOpacity)(
  {
    alignItems: 'center',
    borderRadius: 14,
    height: 25,
    justifyContent: 'center',
    width: 25,
  },
  ({ checked = false }) => ({
    backgroundColor: checked ? CommonStyles.primary : '#FFFFFF',
    borderColor: checked ? CommonStyles.primary : '#DDDDDD',
    borderWidth: checked ? 0 : 2,
  }),
);

export const Checkbox = ({ checked, onUncheck, onCheck }: { checked: boolean; onUncheck?: () => void; onCheck?: () => void }) => (
  <TapCircle onPress={() => (checked ? onUncheck && onUncheck() : onCheck && onCheck())} checked={checked}>
    <Icon size={17} name="checked" color="white" />
  </TapCircle>
);

const squareCheckboxStyle = StyleSheet.create({
  square: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    height: 25,
    width: 25,
    borderColor: CommonStyles.grey,
  },
});

export const SquareCheckbox = ({
  value,
  onChange,
  disabled,
  color,
}: {
  value: boolean;
  onChange?: () => void;
  disabled?: boolean;
  color?: string;
}) => {
  const checkedStyle = value
    ? { backgroundColor: color, borderWidth: 0 }
    : { backgroundColor: CommonStyles.lightGrey, borderWidth: 2 };
  const opacity = disabled ? 0.3 : 1;

  return (
    <View style={{ opacity }}>
      <TouchableOpacity disabled={disabled} onPress={onChange} style={[squareCheckboxStyle.square, checkedStyle]}>
        <Icon size={17} name="checked" color={CommonStyles.lightGrey} />
      </TouchableOpacity>
    </View>
  );
};
