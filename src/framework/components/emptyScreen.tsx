/**
 * EmptyScreen
 *
 * Show a large component with an image (bitmap), a title at the top and a little paragraph at the bottom.
 * Used to display a friendly empty screen when there is no data to show.
 */

import * as React from 'react';
import { Dimensions, View, ViewStyle } from 'react-native';

import { PageView } from './page';
import { Text, TextSemiBold } from './text';
import theme from '~/app/theme';
import { FlatButton } from '~/ui/FlatButton';
import { UI_SIZES } from './constants';

export const EmptyScreen = ({
  svgImage,
  title,
  text,
  buttonText,
  buttonAction,
  customStyle,
}: {
  svgImage: any;
  title: string;
  text: string;
  buttonText?: string;
  buttonAction?: () => void;
  customStyle?: ViewStyle;
}) => {
  const { width } = Dimensions.get('window');
  const imageWidth = width - 4 * UI_SIZES.spacing.extraLarge;
  const imageRatio = 7 / 5;
  const hasButton = buttonText && buttonAction;

  return (
    <PageView
      style={[
        {
          paddingTop: UI_SIZES.spacing.huge,
          paddingHorizontal: UI_SIZES.spacing.extraLarge,
        },
        customStyle,
      ]}>
      <View style={{ paddingHorizontal: UI_SIZES.spacing.extraLarge }}>
        <View style={{ height: imageWidth / imageRatio }}>{svgImage}</View>
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
      <Text
        numberOfLines={3}
        style={{
          textAlign: 'center',
          marginTop: UI_SIZES.spacing.medium,
        }}>
        {text}
      </Text>
      {hasButton ? (
        <View style={{ marginTop: UI_SIZES.spacing.extraLargePlus }}>
          <FlatButton title={buttonText} onPress={buttonAction} />
        </View>
      ) : null}
    </PageView>
  );
};
