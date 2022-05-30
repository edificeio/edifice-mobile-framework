import * as React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';

export interface BottomSheetProps {
  content: JSX.Element;
}

export const BottomSheet = ({ content }: BottomSheetProps) => {
  return (
    <SafeAreaView style={BottomSheet.styles.outerWrapper}>
      <View style={BottomSheet.styles.innerWrapper}>{content}</View>
    </SafeAreaView>
  );
};
BottomSheet.styles = StyleSheet.create({
  outerWrapper: {
    backgroundColor: theme.ui.background.card,
    borderTopLeftRadius: UI_SIZES.radius.mediumPlus,
    borderTopRightRadius: UI_SIZES.radius.mediumPlus,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 0, height: -6 },
    elevation: 24,
    shadowRadius: 20,
    shadowOpacity: 0.2,
  },
  innerWrapper: {
    alignItems: 'center',
    padding: UI_SIZES.spacing.large,
  },
});
