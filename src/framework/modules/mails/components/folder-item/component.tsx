import * as React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

import styles from './styles';
import { MailsFolderItemProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';

export const MailsFolderItem = (props: MailsFolderItemProps) => {
  const TextComponent = props.selected ? SmallBoldText : SmallText;

  const onPress = () => {
    props.onPress();
  };

  const suppStyles = (): ViewStyle => {
    if (props.depth && props.depth > 1) return { marginLeft: (props.depth - 1) * UI_SIZES.spacing.medium };
    return {};
  };

  return (
    <TouchableOpacity style={[styles.container, suppStyles(), props.selected ? styles.isSelected : {}]} onPress={onPress}>
      <NamedSVG
        name={props.icon}
        fill={theme.palette.grey.black}
        width={UI_SIZES.elements.icon.default}
        height={UI_SIZES.elements.icon.default}
      />
      <TextComponent numberOfLines={1} style={styles.text}>
        {props.name}
      </TextComponent>
    </TouchableOpacity>
  );
};
