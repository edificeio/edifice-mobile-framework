import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacityProps, View, ViewProps, ViewStyle } from 'react-native';

import { getScaleHeight, UI_SIZES } from '~/framework/components/constants';
import { Picture, PictureProps } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';

import { Card, CardWithoutPadding, TouchCard } from './base';

export type PictureCardProps = {
  text?: string | React.ReactElement;
  textStyle?: TextStyle;
  picture: PictureProps;
  pictureStyle?: ViewStyle;
} & ViewProps;

type PictureCardComponent = typeof Card | typeof CardWithoutPadding | typeof TouchCard;

type PictureCardTextProps = Readonly<Pick<PictureCardProps, 'text' | 'textStyle'>>;

function PictureCardText({ text, textStyle }: PictureCardTextProps) {
  if (!text) return null;
  if (typeof text === 'string') {
    return (
      <View style={styles.textWrapper}>
        <SmallText numberOfLines={1} style={[styles.text, textStyle]}>
          {text}
        </SmallText>
      </View>
    );
  }
  return text;
}

function PictureCard_Base(props: PictureCardProps & { cardComponent?: PictureCardComponent }) {
  const { cardComponent, picture, style, text, textStyle, ...viewProps } = props;
  const CC = cardComponent ?? CardWithoutPadding;

  return (
    <CC {...(viewProps as ViewProps & TouchableOpacityProps)} style={[styles.cardContainer, style]}>
      <Picture {...picture} />
      <PictureCardText text={text} textStyle={textStyle} />
    </CC>
  );
}
export function PictureCard(props: PictureCardProps) {
  return <PictureCard_Base cardComponent={Card} {...props} />;
}
export function TouchablePictureCard(props: PictureCardProps & TouchableOpacityProps) {
  return <PictureCard_Base cardComponent={TouchCard} {...props} />;
}

function SelectorPictureCard_Base(props: PictureCardProps & { cardComponent?: PictureCardComponent }) {
  const { cardComponent, picture, pictureStyle, style, ...rest } = props;
  picture.style = { maxWidth: '100%', ...pictureStyle };
  if (picture.type === 'Image') picture.resizeMode = 'contain';
  return (
    <PictureCard_Base
      cardComponent={cardComponent ?? Card}
      style={[styles.selectorCardPadding, style]}
      picture={picture}
      {...rest}
    />
  );
}
export function SelectorPictureCard(props: PictureCardProps) {
  return <SelectorPictureCard_Base cardComponent={Card} {...props} />;
}
export function TouchableSelectorPictureCard(props: PictureCardProps & TouchableOpacityProps) {
  return <SelectorPictureCard_Base cardComponent={TouchCard} {...props} />;
}

export type OverviewCardProps = {
  title?: string | React.ReactElement;
  picture?: PictureProps;
  pictureStyle?: PictureProps['style'];
  pictureWrapperStyle?: ViewStyle;
} & ViewProps;

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorCardPadding: {
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  text: {
    lineHeight: undefined,
    textAlign: 'center',
  },
  textWrapper: {
    alignItems: 'center',
    height: getScaleHeight(20) * 1.5,
    justifyContent: 'center',
    marginTop: UI_SIZES.spacing.tiny,
  },
});
