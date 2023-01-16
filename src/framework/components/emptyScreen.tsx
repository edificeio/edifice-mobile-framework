/**
 * EmptyScreen
 *
 * A friendly empty screen for when there is no data to show.
 * Shows a large image (svg) with a title, an optional paragraph and an optional action button.
 */
import * as React from 'react';
import { ColorValue, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';

import { ActionButton } from './action-button';
import { UI_SIZES, getScaleDimension } from './constants';
import { PageViewStyle } from './page';
import { HeadingSText, SmallText } from './text';

export const EmptyScreen = ({
  svgImage,
  title,
  text,
  buttonText,
  buttonUrl,
  buttonAction,
  buttonIcon,
  customStyle,
  svgFillColor,
  textColor,
}: {
  svgImage: string;
  title: string;
  text?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonAction?: () => void;
  buttonIcon?: string;
  customStyle?: ViewStyle;
  svgFillColor?: ColorValue;
  textColor?: ColorValue;
}) => {
  const imageWidth = getScaleDimension(280, 'image');
  const imageHeight = getScaleDimension(200, 'image');
  const hasButton = buttonText && (buttonUrl || buttonAction);
  return (
    <PageViewStyle
      style={[
        {
          paddingTop: UI_SIZES.spacing.huge,
          paddingHorizontal: UI_SIZES.spacing.big,
        },
        customStyle,
      ]}>
      <NamedSVG style={{ alignSelf: 'center' }} name={svgImage} width={imageWidth} height={imageHeight} fill={svgFillColor} />
      {title ? (
        <HeadingSText
          numberOfLines={2}
          style={{
            textAlign: 'center',
            color: textColor ?? theme.palette.primary.regular,
            marginTop: UI_SIZES.spacing.large,
          }}>
          {title}
        </HeadingSText>
      ) : null}
      {text ? (
        <SmallText
          // numberOfLines={5}
          style={{
            textAlign: 'center',
            ...(textColor ? { color: textColor } : {}),
            marginTop: UI_SIZES.spacing.small,
          }}>
          {text}
        </SmallText>
      ) : null}
      {hasButton ? (
        <View style={{ marginTop: UI_SIZES.spacing.large }}>
          <ActionButton text={buttonText} url={buttonUrl} action={buttonAction} iconName={buttonIcon} />
        </View>
      ) : null}
    </PageViewStyle>
  );
};
