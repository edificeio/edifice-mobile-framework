import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';

import styles from './styles';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture, Svg } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import {
  FileMedia,
  getMediaIcon,
  ImageMedia,
  isFileMedia,
  isImageMedia,
  isLinkMedia,
  LinkMedia,
  Media,
  toURISource,
} from '~/framework/util/media';
import { Image } from '~/framework/util/media-deprecated';
import { sessionImageSource } from '~/framework/util/transport';

export interface MediaDefaultItemProps {
  media: Media;
}

export function MediaDefaultItem({
  media,
}: Readonly<{
  media: Media;
}>) {
  const icon = getMediaIcon(media);
  return (
    <>
      <View style={styles.iconCard}>
        <Picture
          {...icon}
          width={UI_SIZES.elements.icon.xlarge}
          height={UI_SIZES.elements.icon.xlarge}
          {...(icon.type === 'Svg' ? { fill: theme.palette.grey.stone } : undefined)}
        />
      </View>
    </>
  );
}

export function MediaNamedItem({
  media,
}: Readonly<{
  media: FileMedia | LinkMedia;
}>) {
  const icon = getMediaIcon(media);
  return (
    <>
      <View style={styles.iconCard}>
        <Picture
          {...icon}
          width={UI_SIZES.elements.icon.xlarge}
          height={UI_SIZES.elements.icon.xlarge}
          {...(icon.type === 'Svg' ? { fill: theme.palette.grey.stone } : undefined)}
        />
      </View>

      <View style={styles.titleCard}>
        <SmallText ellipsizeMode="tail" numberOfLines={1} style={styles.titleText}>
          {media.name}
        </SmallText>
      </View>
    </>
  );
}

export function MediaImageItem({
  media,
}: Readonly<{
  media: ImageMedia;
}>) {
  const source = sessionImageSource(toURISource(media.src));
  return <Image source={source} style={styles.mediaImageCard} />;
}

export interface MediaItemProps {
  media: Media;
  style?: ViewProps['style'];
  onPress?: TouchableOpacityProps['onPress'];
}

export function MediaItem({ media, onPress, style }: Readonly<MediaItemProps>) {
  const WrapperComponent = onPress ? TouchableOpacity : View;
  let itemElement: React.ReactElement;
  if (isImageMedia(media)) {
    itemElement = <MediaImageItem media={media} />;
  } else if (isFileMedia(media) || isLinkMedia(media)) {
    itemElement = <MediaNamedItem media={media} />;
  } else {
    itemElement = <MediaDefaultItem media={media} />;
  }
  return (
    <WrapperComponent onPress={onPress} style={React.useMemo(() => [styles.mediaCard, style], [style])}>
      {itemElement}
    </WrapperComponent>
  );
}
