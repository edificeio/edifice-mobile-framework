import * as React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { UI_SIZES } from './constants';

import theme from '~/app/theme';

export interface BottomSheetProps {
  content: JSX.Element;
  displayShadow?: boolean;
}

export const BottomSheet = ({ content, displayShadow }: BottomSheetProps) => {
  return (
    <SafeAreaView style={[BottomSheet.styles.outerWrapper, displayShadow && BottomSheet.styles.outerWrapperShadow]}>
      <View style={BottomSheet.styles.innerWrapper}>{content}</View>
    </SafeAreaView>
  );
};
BottomSheet.styles = StyleSheet.create({
  innerWrapper: {
    alignItems: 'center',
    padding: UI_SIZES.spacing.medium,
  },
  outerWrapper: {
    backgroundColor: theme.ui.background.card,
    borderTopLeftRadius: UI_SIZES.radius.mediumPlus,
    borderTopRightRadius: UI_SIZES.radius.mediumPlus,
  },
  outerWrapperShadow: {
    elevation: 24,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { height: -6, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
});
