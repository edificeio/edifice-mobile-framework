/**
 * EmptyScreen
 *
 * A friendly empty screen for when there is no data to show.
 * Shows a large image (svg) with a title, an optional paragraph and an optional action button.
 */
import * as React from 'react';
import { View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { NamedSVG } from '~/framework/components/picture/NamedSVG';

import { ActionButton } from './ActionButton';
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
}: {
  svgImage: string;
  title: string;
  text?: string;
  buttonText?: string;
  buttonUrl?: string;
  buttonAction?: () => void;
  buttonIcon?: string;
  customStyle?: ViewStyle;
}) => {
  const imageWidth = getScaleDimension(280, 'width');
  const imageHeight = getScaleDimension(200, 'height');
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
      <NamedSVG style={{ alignSelf: 'center' }} name={svgImage} width={imageWidth} height={imageHeight} />
      <HeadingSText
        numberOfLines={2}
        style={{
          textAlign: 'center',
          color: theme.palette.primary.regular,
          marginTop: UI_SIZES.spacing.large,
        }}>
        {title}
      </HeadingSText>
      {text ? (
        <SmallText
          // numberOfLines={5}
          style={{
            textAlign: 'center',
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
