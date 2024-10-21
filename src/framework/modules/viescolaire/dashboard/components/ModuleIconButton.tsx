import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture';
import { SmallInverseText } from '~/framework/components/text';

const styles = StyleSheet.create({
  gridButton: {
    borderRadius: 5,
  },
  gridButtonAllModules: {
    justifyContent: 'flex-start',
  },
  gridButtonContainer: {
    paddingHorizontal: UI_SIZES.spacing.tiny,
    paddingVertical: UI_SIZES.spacing.minor,
  },
  gridButtonLineModules: {
    justifyContent: 'center',
  },
  gridButtonText: {
    marginLeft: UI_SIZES.spacing.minor,
    textAlign: 'center',
  },
  gridButtonTextWidthFull: {
    width: '100%',
  },
  gridButtonTextWidthHalf: {
    width: '50%',
  },
  viewButton: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: UI_SIZES.spacing.minor,
  },
});

interface ModuleIconButtonProps {
  color: string;
  icon: string;
  nbModules: number;
  text: string;
  onPress: () => void;
}

export const ModuleIconButton = ({ color, icon, nbModules, onPress, text }: ModuleIconButtonProps) => {
  return (
    <View style={[styles.gridButtonContainer, nbModules === 4 ? styles.gridButtonTextWidthHalf : styles.gridButtonTextWidthFull]}>
      <TouchableOpacity onPress={onPress} style={[styles.gridButton, { backgroundColor: color }]}>
        <View style={[styles.viewButton, nbModules === 4 ? styles.gridButtonAllModules : styles.gridButtonLineModules]}>
          <Icon size={20} color={theme.ui.text.inverse} name={icon} />
          <SmallInverseText style={styles.gridButtonText}>{text}</SmallInverseText>
        </View>
      </TouchableOpacity>
    </View>
  );
};
