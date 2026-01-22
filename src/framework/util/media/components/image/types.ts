import RN, { DimensionValue } from 'react-native';

import { NumberProp } from 'react-native-svg';

import { EntAppTheme } from '~/app/theme';
import { PictureProps } from '~/framework/components/picture';

export type FallbackIconTheme = Omit<EntAppTheme, 'accentColors'> & {
  accentColors: Pick<EntAppTheme['accentColors'], 'regular' | 'pale'>;
};

export interface ImageProps extends Omit<RN.ImageProps, 'src' | 'srcSet'> {
  thumbnail?: string;
  fallback?: FallbackIconTheme | PictureProps;
  iconSize?: DimensionValue & NumberProp;
}

export type ImageFallbackProps = Pick<ImageProps, 'fallback' | 'iconSize' | 'style' | 'testID'>;

export const enum ImageLoadingState {
  Loading,
  Success,
  Error,
}
