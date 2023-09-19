import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';
import { NamedSVG } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';
import { RichToolbarNavigationButtonProps } from './types';

import { UI_SIZES } from '~/framework/components/constants';
import styles from './styles';

export const RichToolbarNavigationButton = (props: RichToolbarNavigationButtonProps) => {
  const handlePress = () => {};

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <BodyBoldText>{props.title}</BodyBoldText>
      <NamedSVG
        name="ui-rafterRight"
        height={UI_SIZES.elements.icon.small}
        width={UI_SIZES.elements.icon.small}
        fill={theme.palette.grey.darkness}
      />
    </TouchableOpacity>
  );
};
