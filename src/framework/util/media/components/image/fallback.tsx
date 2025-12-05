import React from 'react';
import { Image, View } from 'react-native';

import styles from './styles';
import { FallbackIconTheme, ImageFallbackProps } from './types';

import theme from '~/app/theme';
import { PictureProps, Svg } from '~/framework/components/picture';

const DEFAULT_FALLBACK = {
  accentColors: {
    pale: theme.palette.grey.pearl,
    regular: theme.palette.grey.grey,
  },
  icon: {
    name: 'ui-image',
    type: 'Svg',
  },
} as const;

const DEFAULT_ICON_SIZE = '58%';

const isFallbackAPicture = (f: ImageFallbackProps['fallback']): f is PictureProps =>
  (f as Exclude<ImageFallbackProps['fallback'], FallbackIconTheme>)?.type !== undefined;

export const ImageFallback: React.FC<ImageFallbackProps> = ({
  fallback = DEFAULT_FALLBACK,
  iconSize = DEFAULT_ICON_SIZE,
  style,
  testID,
}) => {
  const backgroundColor = isFallbackAPicture(fallback) ? DEFAULT_FALLBACK.accentColors.pale : fallback.accentColors.pale;

  const picture: PictureProps = React.useMemo(() => {
    if (isFallbackAPicture(fallback)) return fallback;
    else
      return {
        ...fallback.icon,
        fill: fallback.accentColors.regular ?? DEFAULT_FALLBACK.accentColors.regular,
      };
  }, [fallback]);

  const pictureElement =
    picture.type === 'Svg' ? (
      <Svg {...picture} height={iconSize} width={iconSize} />
    ) : picture.type === 'Icon' ? (
      <Svg {...DEFAULT_FALLBACK.icon} height={iconSize} width={iconSize} />
    ) : picture.type === 'Image' ? (
      <Image {...picture} />
    ) : null;

  return (
    <View testID={testID} style={React.useMemo(() => [{ backgroundColor }, styles.fallback, style], [backgroundColor, style])}>
      {pictureElement}
    </View>
  );
};
