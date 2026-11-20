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
        <SmallText numberOfLines={1} style={[styles.text, textStyle]}>
          {text}
        </SmallText>
      </View>
    );
  }
  return text;
}

function PictureCardBase(props: PictureCardProps & { cardComponent?: PictureCardComponent }) {
  const { cardComponent, picture, style, text, textStyle, ...viewProps } = props;
  const CardComponent = cardComponent ?? CardWithoutPadding;

  return (
    <CardComponent {...(viewProps as ViewProps & TouchableOpacityProps)} style={[styles.cardContainer, style]}>
      <Picture {...picture} />
      <PictureCardText text={text} textStyle={textStyle} />
    </CardComponent>
  );
}

function SelectorPictureCardBase(props: PictureCardProps & { cardComponent?: PictureCardComponent }) {
  const { cardComponent, picture, pictureStyle, style, ...rest } = props;
  picture.style = { maxWidth: '100%', ...pictureStyle };
  if (picture.type === 'Image') picture.resizeMode = 'contain';
  return (
    <PictureCardBase
      cardComponent={cardComponent ?? Card}
      style={[styles.selectorCardPadding, style]}
      picture={picture}
      {...rest}
    />
  );
}
export function TouchableSelectorPictureCard(props: PictureCardProps & TouchableOpacityProps) {
  return <SelectorPictureCardBase cardComponent={TouchCard} {...props} />;
}
