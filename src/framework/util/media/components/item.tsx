import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';

import styles from './styles';

import theme from '~/app/theme';
import IconButton from '~/framework/components/buttons/icon';
import PrimaryButton from '~/framework/components/buttons/primary';
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
  isVideoMedia,
  LinkMedia,
  Media,
  toURISource,
  VideoMedia,
} from '~/framework/util/media';
import { Image } from '~/framework/util/media-deprecated';
import { sessionImageSource, sessionURISource } from '~/framework/util/transport';

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

const toThumbnailSource = (source: Media['src'], size: [number, number] | number): ReturnType<typeof toURISource> => {
  const uri = sessionURISource(toURISource(source)).uri;
  if (!uri) return { uri: undefined };
  const url = new URL(uri);
  const sizeParamValue = Array.isArray(size) ? `${size[0]}x${size[1]}` : `${size[0]}x0}`;
  url.searchParams.set('thumbnail', sizeParamValue);
  return toURISource(url.href);
};

export function MediaVideoItem({
  media,
}: Readonly<{
  media: VideoMedia;
}>) {
  const [width, setWidth] = React.useState<number | undefined>(undefined);
  const onLayout = React.useCallback<NonNullable<ViewProps['onLayout']>>(({ nativeEvent }) => {
    setWidth(nativeEvent.layout.width);
  }, []);
  const source = width
    ? media.poster
      ? toThumbnailSource(sessionURISource(toURISource(media.poster)), width)
      : toThumbnailSource(media.src, width)
    : undefined;
  return (
    <>
      <Image source={source} style={styles.mediaImageCard} />
      <View style={styles.mediaVideoOverlay} onLayout={onLayout}>
        <PrimaryButton round iconLeft="ui-play-filled" />
      </View>
    </>
  );
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
  } else if (isVideoMedia(media)) {
    itemElement = <MediaVideoItem media={media} />;
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
