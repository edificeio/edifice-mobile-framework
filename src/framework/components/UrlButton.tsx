import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { Icon } from './icon';
import { TextSemiBold, TextSizeStyle } from './text';

export interface UrlButtonProps {
  text: string;
  url: string;
}

export const UrlButton = ({ text, url }: UrlButtonProps) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.palette.primary.regular,
        paddingVertical: UI_SIZES.spacing.smallPlus,
        paddingHorizontal: UI_SIZES.spacing.large,
        borderRadius: UI_SIZES.radius.extraLarge,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={() => console.log(url)}>
      <TextSemiBold style={{ color: theme.color.text.inverse, marginRight: UI_SIZES.spacing.smallPlus }}>{text}</TextSemiBold>
      <Icon name="warning" color={theme.color.text.inverse} size={TextSizeStyle.Normal.fontSize} />
    </TouchableOpacity>
  );
};

//TODO:
//⚪️ insert correct icon
//⚪️ manage onPress
