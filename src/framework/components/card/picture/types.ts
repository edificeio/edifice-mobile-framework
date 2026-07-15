import { TextStyle, ViewProps, ViewStyle } from 'react-native';

import { PictureProps } from '~/framework/components/picture';

import { Card, CardWithoutPadding, TouchCard } from '../base';

export type PictureCardProps = {
  text?: string | React.ReactElement;
  textStyle?: TextStyle;
  picture: PictureProps;
  pictureStyle?: ViewStyle;
} & ViewProps;

export type OverviewCardProps = {
  title?: string | React.ReactElement;
  picture?: PictureProps;
  pictureStyle?: PictureProps['style'];
  pictureWrapperStyle?: ViewStyle;
} & ViewProps;

export type PictureCardComponent = typeof Card | typeof CardWithoutPadding | typeof TouchCard;

export type PictureCardTextProps = Readonly<Pick<PictureCardProps, 'text' | 'textStyle'>>;
