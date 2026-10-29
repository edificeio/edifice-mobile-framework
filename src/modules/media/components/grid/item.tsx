import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, View, ViewProps } from 'react-native';

import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import { Image } from '~/modules/media/components/image';
import { getMediaIcon } from '~/modules/media/display';
import { resolveUrl } from '~/modules/media/source';
import {
  type FileMedia,
  type ImageMedia,
  isFileMedia,
  isImageMedia,
  isLinkMedia,
  isVideoMedia,
  type LinkMedia,
  type Media,
  type VideoMedia,
} from '~/modules/media/types';
import { toURISource } from '~/modules/media/util';

import styles from './styles';

export interface MediaDefaultItemProps {
  media: Media;
}

function MediaIcon({ icon }: { icon: ReturnType<typeof getMediaIcon> }) {
  if (typeof icon === 'string') {
    return <HeadingXSText style={styles.mediaIconText}>{icon}</HeadingXSText>;
  } else {
    return (
      <Picture
        {...icon}
        width={UI_SIZES.elements.icon.mediumlarge}
        height={UI_SIZES.elements.icon.mediumlarge}
        {...(icon.type === 'Svg' ? { fill: theme.palette.grey.stone } : undefined)}
      />
    );
  }
}

export function MediaDefaultItem({
  media,
}: Readonly<{
  media: Media;
}>) {
  return (
    <>
      <View style={styles.iconCard}>
        <MediaIcon icon={getMediaIcon(media)} />
      </View>
    </>
  );
}

export function MediaNamedItem({
  media,
}: Readonly<{
  media: FileMedia | LinkMedia;
}>) {
  return (
    <>
      <View style={styles.iconCard}>
        <MediaIcon icon={getMediaIcon(media)} />
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
  return <Image source={toURISource(media.src)} style={styles.mediaImageCard} />;
}

const toThumbnailSource = (source: Media['src'], size: [number, number] | number): ReturnType<typeof toURISource> => {
  const uri = toURISource(source).uri;
  if (!uri) return { uri: undefined };
  // The url must be complete to be changed (a source that has no domain is the one of the platform)
  const url = new URL(resolveUrl(uri));
  const sizeParamValue = Array.isArray(size) ? `${size[0]}x${size[1]}` : `${size}x0`;
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
  const source = width ? (media.poster ? toThumbnailSource(media.poster, width) : toThumbnailSource(media.src, width)) : undefined;
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
  testID?: string;
}

export function MediaItem({ media, onPress, style, testID }: Readonly<MediaItemProps>) {
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
    <WrapperComponent onPress={onPress} style={React.useMemo(() => [styles.mediaCard, style], [style])} testID={testID}>
      {itemElement}
    </WrapperComponent>
  );
}
