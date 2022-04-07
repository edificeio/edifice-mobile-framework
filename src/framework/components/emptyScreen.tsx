/**
 * EmptyScreen
 *
 * A friendly empty screen for when there is no data to show.
 * Shows a large image (svg) with a title, an optional paragraph and an optional action button.
 */

import * as React from 'react';
import { View, ViewStyle } from 'react-native';

import { PageView_Style } from './page';
import { Text, TextSemiBold } from './text';
import theme from '~/app/theme';
import { FlatButton } from '~/ui/FlatButton';
import { UI_SIZES } from './constants';

import { NamedSVG } from '~/framework/components/picture/NamedSVG';

export const EmptyScreen = ({
  svgImage,
  title,
  text,
  buttonText,
  buttonAction,
  customStyle,
}: {
  svgImage: string;
  title: string;
  text?: string;
  buttonText?: string;
  buttonAction?: () => void;
  customStyle?: ViewStyle;
}) => {
  const imageWidth = UI_SIZES.screen.width - 4 * UI_SIZES.spacing.extraLarge;
  const imageHeight = imageWidth / UI_SIZES.aspectRatios.thumbnail;
  const hasButton = buttonText && buttonAction;
  return (
    <PageView_Style
      style={[
        {
          paddingTop: UI_SIZES.spacing.huge,
          paddingHorizontal: UI_SIZES.spacing.extraLarge,
        },
        customStyle,
      ]}>
      <View style={{ paddingHorizontal: UI_SIZES.spacing.extraLarge }}>
        <View style={{ height: imageHeight }}>
          <NamedSVG name={svgImage} width={imageWidth} height={imageHeight} />
        </View>
      </View>
      <TextSemiBold
        numberOfLines={2}
        style={{
          textAlign: 'center',
          fontSize: 18,
          color: theme.color.secondary.regular,
          marginTop: UI_SIZES.spacing.extraLargePlus,
        }}>
        {title}
      </TextSemiBold>
      {text ? (
        <Text
          numberOfLines={3}
          style={{
            textAlign: 'center',
            marginTop: UI_SIZES.spacing.medium,
          }}>
          {text}
        </Text>
      ) : null}
      {hasButton ? (
        <View style={{ marginTop: UI_SIZES.spacing.extraLargePlus }}>
          <FlatButton title={buttonText} onPress={buttonAction} />
        </View>
      ) : null}
    </PageView_Style>
  );
};
