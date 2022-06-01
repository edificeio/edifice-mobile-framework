import styled from '@emotion/native';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { CommonStyles } from '~/styles/common/styles';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

const TapCircle = styled(TouchableOpacity)<{ checked: boolean }>(
  {
    alignItems: 'center',
    borderRadius: 14,
    height: 25,
    justifyContent: 'center',
    width: 25,
  },
  ({ checked = false }) => ({
    backgroundColor: checked ? theme.palette.primary.regular : theme.ui.text.inverse,
    borderColor: checked ? theme.palette.primary.regular : theme.palette.grey.grey,
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
