import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { BottomColoredItem } from '~/framework/modules/viescolaire/dashboard/components/Item';
import { Image, formatSource } from '~/framework/util/media';

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
  gridButtonImage: {
    height: 70,
    width: 70,
  },
});

interface ModuleButtonProps {
  color: string;
  imageSrc: string;
  text: string;
  disabled?: boolean;
  onPress: () => void;
}

export const ModuleButton = ({ color, imageSrc, text, disabled, onPress }: ModuleButtonProps) => {
  return (
    <View style={styles.gridButtonContainer}>
      <BottomColoredItem
        shadow
        style={[styles.gridButton, disabled ? styles.gridButtonDisabled : styles.gridButtonEnabled]}
        color={color}
        onPress={onPress}
        disabled={disabled}>
        <Image source={formatSource(imageSrc)} style={styles.gridButtonImage} resizeMode="contain" />
        <SmallText>{text}</SmallText>
      </BottomColoredItem>
    </View>
  );
};
