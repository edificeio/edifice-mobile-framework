import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import styles from './styles';
import { MailsFolderItemProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';

export const MailsFolderItem = (props: MailsFolderItemProps) => {
  const TextComponent = props.selected ? SmallBoldText : SmallText;

  return (
    <TouchableOpacity style={[styles.container, props.selected ? styles.containerUnread : {}]}>
      <NamedSVG
        name={props.icon}
        fill={theme.palette.grey.black}
        width={UI_SIZES.elements.icon.default}
        height={UI_SIZES.elements.icon.default}
      />
      <TextComponent>{props.name}</TextComponent>
    </TouchableOpacity>
  );
};
