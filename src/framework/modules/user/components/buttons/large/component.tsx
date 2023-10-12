import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallBoldText } from '~/framework/components/text';

import styles from './styles';
import { LargeButtonProps } from './types';

export const LargeButton = ({ action, icon, text }: LargeButtonProps) => {
  return (
    <TouchableOpacity onPress={action} style={styles.container}>
      <View style={styles.iconContainer}>
        <NamedSVG
          name={icon}
          width={UI_SIZES.elements.icon.default}
          height={UI_SIZES.elements.icon.default}
          fill={theme.palette.grey.black}
        />
      </View>
      <SmallBoldText style={styles.text}>{text}</SmallBoldText>
    </TouchableOpacity>
  );
};
