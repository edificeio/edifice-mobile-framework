import * as React from 'react';
import { View } from 'react-native';

import { Grayscale } from 'react-native-color-matrix-image-filters';

import styles from './styles';
import { ThumbnailThreadProps } from './types';

import theme from '~/app/theme';
import { getScaleHeight } from '~/framework/components/constants';
import { Svg, SvgProps } from '~/framework/components/picture';
import { ThreadItemStatus } from '~/framework/modules/news/components/thread-item';
import moduleConfig from '~/framework/modules/news/module-config';
import { Image } from '~/framework/util/media-deprecated';

const Selected = () => (
  <View style={[styles.thumbnailSelectedItem, { borderColor: (moduleConfig.displayPicture as SvgProps).fill }]} />
);
const rawNewsIconName = 'actualites-large';

export default function ThumbnailThread({ status = ThreadItemStatus.DEFAULT, ...props }: ThumbnailThreadProps) {
  const { icon, square } = props;

  const [error, setError] = React.useState(false);

  const globalStyle = [
    styles.thumbnailItem,
    { backgroundColor: moduleConfig.displayColor.pale },
    { ...(square ? styles.thumbnailItemSquare : styles.thumbnailItemRectangle) },
  ];
  const heightSVGNoIcon = square ? getScaleHeight(12.5) : getScaleHeight(40);

  if (icon && !error && status === ThreadItemStatus.SELECTED) {
    return (
      <View style={styles.thumbnailContainerSelected}>
        <Selected />
        <Image source={icon} style={globalStyle} onError={() => setError(true)} />
      </View>
    );
  }
  if (icon && !error && status === ThreadItemStatus.DISABLED) {
    return (
      <Grayscale>
        <Image source={icon} style={globalStyle} onError={() => setError(true)} />
      </Grayscale>
    );
  }
  if (icon && !error && status === ThreadItemStatus.DEFAULT) {
    return <Image source={icon} style={globalStyle} onError={() => setError(true)} />;
  }
  if (status === ThreadItemStatus.SELECTED) {
    return (
      <View style={[globalStyle, styles.thumbnailContainerSelected]}>
        <Selected />
        <Svg name={rawNewsIconName} fill={(moduleConfig.displayPicture as SvgProps).fill} height={heightSVGNoIcon} />
      </View>
    );
  }
  if (status === ThreadItemStatus.DISABLED) {
    return (
      <View style={[globalStyle, styles.thumbnailNoIconDisabled]}>
        <Svg name={rawNewsIconName} fill={theme.palette.grey.graphite} height={heightSVGNoIcon} />
      </View>
    );
  }
  return (
    <View style={globalStyle}>
      <Svg name={rawNewsIconName} fill={(moduleConfig.displayPicture as SvgProps).fill} height={heightSVGNoIcon} />
    </View>
  );
}
