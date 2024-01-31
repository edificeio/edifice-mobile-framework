import * as React from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { BottomColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';

const styles = StyleSheet.create({
  gridButtonContainer: {
    width: '50%',
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    elevation: 20,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  gridButton: {
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: theme.palette.grey.white,
  },
  gridButtonEnabled: {
    opacity: 1,
  },
  gridButtonDisabled: {
    opacity: 0.6,
  },
});

interface ModuleButtonProps {
  color: ColorValue;
  icon: string;
  text: string;
  disabled?: boolean;
  onPress: () => void;
}

export const ModuleButton = ({ color, icon, text, disabled, onPress }: ModuleButtonProps) => {
  return (
    <View style={styles.gridButtonContainer}>
      <BottomColoredItem
        shadow
        style={[styles.gridButton, disabled ? styles.gridButtonDisabled : styles.gridButtonEnabled]}
        color={color}
        onPress={onPress}
        disabled={disabled}>
        <NamedSVG name={icon} height={70} width={70} fill={color} />
        <SmallText>{text}</SmallText>
      </BottomColoredItem>
    </View>
  );
};
