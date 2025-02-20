import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import styles from './styles';
import { ActionButtonBottomSheetModalProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';

export const ActionButtonBottomSheetModal = (props: ActionButtonBottomSheetModalProps) => {
  return (
    <TouchableOpacity style={styles.container} {...props}>
      <Svg
        height={UI_SIZES.elements.icon.default}
        width={UI_SIZES.elements.icon.default}
        name={props.icon}
        fill={theme.palette.grey.black}
      />
      <BodyText>{props.title}</BodyText>
    </TouchableOpacity>
  );
};
