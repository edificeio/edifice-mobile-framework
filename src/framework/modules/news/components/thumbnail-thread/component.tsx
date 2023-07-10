import * as React from 'react';
import { View } from 'react-native';
import { Grayscale } from 'react-native-color-matrix-image-filters';

import theme from '~/app/theme';
import { NamedSVG } from '~/framework/components/picture';
import { ThreadItemStatus } from '~/framework/modules/news/components/thread-item';
import { Image } from '~/framework/util/media';

import styles from './styles';
import { ThumbnailThreadProps } from './types';

export default function ThumbnailThread({ status = ThreadItemStatus.DEFAULT, ...props }: ThumbnailThreadProps) {
  const { icon, square } = props;

  const globalStyle = [styles.thumbnailItem, { ...(square ? styles.thumbnailItemSquare : styles.thumbnailItemRectangle) }];
  const heightSVGNoIcon = square ? 12.5 : 40;

  if (icon && status === ThreadItemStatus.SELECTED) {
    return <Image source={icon} style={[globalStyle, styles.thumbnailItemSelected]} />;
  }
  if (icon && status === ThreadItemStatus.DISABLED) {
    return (
      <Grayscale>
        <Image source={icon} style={globalStyle} />
      </Grayscale>
    );
  }
  if (icon && status === ThreadItemStatus.DEFAULT) {
    return <Image source={icon} style={globalStyle} />;
  }
  if (!icon && status === ThreadItemStatus.SELECTED) {
    return (
      <View style={[globalStyle, styles.thumbnailItemSelected]}>
        <NamedSVG name="newsFeed" fill={theme.palette.primary.regular} height={heightSVGNoIcon} />
      </View>
    );
  }
  if (!icon && status === ThreadItemStatus.DISABLED) {
    return (
      <View style={[globalStyle, styles.thumbnailNoIconDisabled]}>
        <NamedSVG name="newsFeed" fill={theme.palette.grey.graphite} height={heightSVGNoIcon} />
      </View>
    );
  }
  return (
    <View style={globalStyle}>
      <NamedSVG name="newsFeed" fill={theme.palette.primary.regular} height={heightSVGNoIcon} />
    </View>
  );
}
