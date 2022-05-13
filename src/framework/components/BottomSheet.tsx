import * as React from 'react';
import { SafeAreaView, View } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';

export interface BottomSheetProps {
  content: JSX.Element;
}

export const BottomSheet = ({ content }: BottomSheetProps) => {
  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.color.background.card,
        borderTopLeftRadius: UI_SIZES.radius.mediumPlus,
        borderTopRightRadius: UI_SIZES.radius.mediumPlus,
        shadowColor: theme.color.shadowColor,
        shadowOffset: { width: 0, height: -6 },
        elevation: 24,
        shadowRadius: 20,
        shadowOpacity: 0.2,
      }}>
      <View
        style={{
          alignItems: 'center',
          padding: UI_SIZES.spacing.large,
        }}>
        {content}
      </View>
    </SafeAreaView>
  );
};
