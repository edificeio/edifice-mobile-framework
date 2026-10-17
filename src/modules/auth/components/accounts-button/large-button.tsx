import * as React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';

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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.mediumPlus,
    elevation: 4,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  iconContainer: {
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.huge,
    padding: UI_SIZES.spacing.small,
  },
  text: { marginLeft: UI_SIZES.spacing.medium },
});
