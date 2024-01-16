import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture';
import { SmallInverseText } from '~/framework/components/text';

const styles = StyleSheet.create({
  gridButtonContainer: {
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.tiny,
  },
  gridButton: {
    borderRadius: 5,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_SIZES.spacing.minor,
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
  gridButtonAllModules: {
    justifyContent: 'flex-start',
  },
  gridButtonLineModules: {
    justifyContent: 'center',
  },
});

interface ModuleIconButtonProps {
  color: string;
  icon: string;
  nbModules: number;
  text: string;
  onPress: () => void;
}

export const ModuleIconButton = ({ color, icon, nbModules, text, onPress }: ModuleIconButtonProps) => {
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
