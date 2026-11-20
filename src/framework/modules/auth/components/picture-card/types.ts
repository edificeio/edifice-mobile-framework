import { TextStyle, ViewProps, ViewStyle } from 'react-native';

import { Card, CardWithoutPadding, TouchCard } from '~/framework/components/card/base';
import { PictureProps } from '~/framework/components/picture';

export type PictureCardProps = {
  text?: string | React.ReactElement;
  textStyle?: TextStyle;
  picture: PictureProps;
  pictureStyle?: ViewStyle;
} & ViewProps;

export type PictureCardComponent = typeof Card | typeof CardWithoutPadding | typeof TouchCard;

export type PictureCardTextProps = Readonly<Pick<PictureCardProps, 'text' | 'textStyle'>>;
