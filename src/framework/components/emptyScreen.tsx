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

import { UI_SIZES, getScaleImageSize } from './constants';
import { PageViewStyle } from './page';
import { HeadingSText, SmallText } from './text';
import PrimaryButton from './buttons/primary';

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
  const imageWidth = getScaleImageSize(280);
  const imageHeight = getScaleImageSize(200);
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
          <PrimaryButton text={buttonText} url={buttonUrl} action={buttonAction} iconRight={buttonIcon} />
        </View>
      ) : null}
    </PageViewStyle>
  );
};
