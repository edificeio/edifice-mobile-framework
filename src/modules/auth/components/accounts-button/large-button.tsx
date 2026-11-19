import * as React from 'react';
import { StyleProp, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';

import styles from './styles';

export interface LargeButtonProps {
  action: () => void;
  icon: React.ComponentProps<typeof Svg>['name'];
  style?: StyleProp<ViewStyle>;
  testID?: string;
  text: string;
}

export const LargeButton = ({ action, icon, style, testID, text }: LargeButtonProps) => (
  <TouchableOpacity onPress={action} style={[styles.container, style]} testID={testID}>
    <View style={styles.iconContainer}>
      <Svg
        name={icon}
        width={UI_SIZES.elements.icon.default}
        height={UI_SIZES.elements.icon.default}
        fill={theme.palette.grey.black}
      />
    </View>
    <SmallBoldText style={styles.text}>{text}</SmallBoldText>
  </TouchableOpacity>
);
