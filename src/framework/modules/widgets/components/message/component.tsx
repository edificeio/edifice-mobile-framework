import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';

const ILLUSTRATION_SIZE = UI_SIZES.elements.icon.xxxlarge;

export interface WidgetMessageProps {
  illustration: SvgIconName;
  text: string;
}

export function WidgetMessage({ illustration, text }: NonNullable<Readonly<WidgetMessageProps>>) {
  return (
    <View style={styles.root}>
      <Svg name={illustration} width={ILLUSTRATION_SIZE} height={ILLUSTRATION_SIZE} />
      <SmallText style={styles.text}>{text}</SmallText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: UI_SIZES.spacing.small,
    padding: UI_SIZES.spacing.medium,
  },
  text: {
    textAlign: 'center',
  },
});
