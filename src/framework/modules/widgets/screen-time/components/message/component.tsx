import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';

import { ScreenTimeMessageProps } from './types';

export function ScreenTimeMessage({ illustration, style, text }: Readonly<ScreenTimeMessageProps>) {
  return (
    <View style={[styles.root, illustration ? styles.illustrated : undefined, style]}>
      {illustration ? <Svg name={illustration} width={ILLUSTRATION_SIZE} height={ILLUSTRATION_SIZE} /> : null}
      <SmallText style={styles.text}>{text}</SmallText>
    </View>
  );
}

const ILLUSTRATION_SIZE = UI_SIZES.elements.icon.xxxlarge;

const styles = StyleSheet.create({
  illustrated: {
    alignItems: 'center',
    gap: UI_SIZES.spacing.small,
  },
  root: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.complementary.yellow.light,
    borderRadius: UI_SIZES.radius.mediumPlus,
    borderWidth: UI_SIZES.border.thin,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.big,
  },
  text: {
    textAlign: 'center',
  },
});
