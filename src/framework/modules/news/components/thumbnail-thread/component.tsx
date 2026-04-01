import * as React from 'react';
import { ColorValue, View } from 'react-native';

import { Grayscale } from 'react-native-color-matrix-image-filters';

import styles from './styles';
import { ThumbnailThreadProps } from './types';

import { getScaleHeight } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { useAppTheme } from '~/framework/modules/myapps/hooks';
import { ThreadItemStatus } from '~/framework/modules/news/components/thread-item';
import { Image } from '~/framework/util/media-deprecated';

const rawNewsIconName = 'actualites-large';

type SelectedProps = {
  borderColor: ColorValue;
};

const Selected = ({ borderColor }: SelectedProps) => <View style={[styles.thumbnailSelectedItem, { borderColor }]} />;

export default function ThumbnailThread({ status = ThreadItemStatus.DEFAULT, ...props }: ThumbnailThreadProps) {
  const { icon, square } = props;
  const appTheme = useAppTheme('news');

  const [error, setError] = React.useState(false);

  const globalStyle = [
    styles.thumbnailItem,
    { backgroundColor: appTheme.colors.pale },
    { ...(square ? styles.thumbnailItemSquare : styles.thumbnailItemRectangle) },
  ];
  const heightSVGNoIcon = square ? getScaleHeight(12.5) : getScaleHeight(40);

  if (icon && !error && status === ThreadItemStatus.SELECTED) {
    return (
      <View style={styles.thumbnailContainerSelected}>
        <Selected borderColor={appTheme.colors.regular} />
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
        <Selected borderColor={appTheme.colors.regular} />
        <Svg name={rawNewsIconName} fill={appTheme.colors.regular} height={heightSVGNoIcon} />
      </View>
    );
  }
  if (status === ThreadItemStatus.DISABLED) {
    return (
      <View style={[globalStyle, styles.thumbnailNoIconDisabled]}>
        <Svg name={rawNewsIconName} fill={appTheme.colors.dark} height={heightSVGNoIcon} />
      </View>
    );
  }
  return (
    <View style={globalStyle}>
      <Svg name={rawNewsIconName} fill={appTheme.colors.regular} height={heightSVGNoIcon} />
    </View>
  );
}
