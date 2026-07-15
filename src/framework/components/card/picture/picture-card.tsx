import React from 'react';
import { TouchableOpacityProps, View, ViewProps } from 'react-native';

import { Card, CardWithoutPadding, TouchCard } from '~/framework/components/card/base';
import { Picture } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';

import { styles } from './styles';
import type { PictureCardComponent, PictureCardProps, PictureCardTextProps } from './types';

function PictureCardText({ text, textStyle }: PictureCardTextProps) {
  if (!text) return null;
  if (typeof text === 'string') {
    return (
      <View style={styles.textWrapper}>
        <SmallText style={[styles.text, textStyle]}>{text}</SmallText>
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
