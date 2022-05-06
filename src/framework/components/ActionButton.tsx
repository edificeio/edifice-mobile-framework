import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';



import theme from '~/app/theme';
import { transformedSrc } from '~/infra/oauth';



import { DEPRECATED_getCurrentPlatform } from '../util/_legacy_appConf';
import { openUrl } from '../util/linking';
import { UI_SIZES } from './constants';
import { Picture } from './picture';
import { TextSemiBold } from './text';


export interface ActionButtonProps {
  text: string;
  url?: string;
  action?: () => void;
  disabled?: boolean;
}

export const ActionButton = ({ text, url, action, disabled }: ActionButtonProps) => {
  const Component = disabled ? View : TouchableOpacity;
  return (
    <Component
      style={{
        backgroundColor: disabled ? theme.color.neutral.regular : theme.color.secondary.regular,
        height: UI_SIZES.dimensions.height.largePlus,
        paddingVertical: UI_SIZES.spacing.smallPlus,
        paddingHorizontal: UI_SIZES.spacing.large,
        borderRadius: UI_SIZES.radius.extraLarge,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        opacity: disabled ? 0.5 : 1
      }}
      { ...(!disabled ? { onPress: () => {
        if (action) {
          action();
        }
        if (url) {
          //TODO: create generic function inside oauth (use in myapps, etc.)
          if (!DEPRECATED_getCurrentPlatform()) {
            return null;
          }
          const fullUrl = transformedSrc(url);
          openUrl(fullUrl);
        }
      }} : {})}>
      <TextSemiBold numberOfLines={1} style={{ color: theme.color.text.inverse, marginRight: UI_SIZES.spacing.smallPlus }}>
        {text}
      </TextSemiBold>
      {url ? (
        <Picture
          type="NamedSvg"
          name="pictos-external-link"
          width={UI_SIZES.dimensions.width.large}
          height={UI_SIZES.dimensions.height.large}
          fill={theme.color.text.inverse}
        />
      ) : null}
    </Component>
  );
};