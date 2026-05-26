/**
 * Media
 * Abstraction over external media sources of different types.
 *
 * @deprecated. Use `./media/index` instead.
 */

import * as React from 'react';
import { ImageURISource, Image as RNImage, ImageProps as RNImageProps, StyleSheet, View } from 'react-native';

import { FastImageProps, default as RNFastImage, Source } from '@d11/react-native-fast-image';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { getSession } from '~/framework/modules/auth/redux/reducer';

import { EmbeddedMedia, FileMedia, MediaType } from './media';
import { sessionImageSource } from './transport';

interface IMediaCommonAttributes {
  src: string | ImageURISource;
  alt?: string;
  mime?: string;
}

export interface IImageAttributes extends IMediaCommonAttributes {}
export interface IVideoAttributes extends IMediaCommonAttributes {
  poster?: string | ImageURISource;
  ratio?: number;
}

export interface IAudioAttributes extends IMediaCommonAttributes {}

export interface IImageMedia extends IImageAttributes {
  type: 'image';
}

export interface IVideoMedia extends IVideoAttributes {
  type: 'video';
}

export interface IAudioMedia extends IAudioAttributes {
  type: 'audio';
}

export interface ILinkMedia extends IMediaCommonAttributes {
  type: 'link';
}

export interface IDocumentMedia extends IMediaCommonAttributes {
  type: 'document';
}

export type IMedia = IImageMedia | IVideoMedia | IAudioMedia | ILinkMedia | IDocumentMedia;

export function formatSource(src: string | ImageURISource) {
  return typeof src === 'string' ? { uri: src } : src;
}

export function formatMediaSource(media: IMediaCommonAttributes) {
  return { ...media, src: formatSource(media.src) };
}

export function formatMediaSourceArray(medias: IMediaCommonAttributes[]) {
  return medias.map(m => formatMediaSource(m));
}

const style = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: 'space-around',
    margin: UI_SIZES.spacing.minor,
  },
  svg: { alignSelf: 'center', flex: 0 },
});

export const UnavailableImage = () => (
  <View style={style.image}>
    <Svg style={style.svg} name="image-not-found" fill={theme.palette.grey.stone} />
  </View>
);

export interface ImageProps extends RNImageProps {
  thumbnail?: string;
}

export class Image extends React.PureComponent<ImageProps> {
  render() {
    const { source: _source, thumbnail, ...imageProps } = this.props;
    try {
      const session = getSession();
      const source = session ? _source && sessionImageSource(_source) : _source;
      if (thumbnail && source && (source as ImageURISource).uri) {
        const url = new URL((source as ImageURISource).uri!);
        url.searchParams.append('thumbnail', thumbnail);
        (source as ImageURISource).uri = url.href;
      }
      return <RNImage source={source} {...imageProps} />;
    } catch {
      return <UnavailableImage {...this.props} />;
    }
  }
}

export class FastImage extends React.PureComponent<FastImageProps> {
  render() {
    try {
      const { source, ...rest } = this.props;
      const session = getSession();
      const newSource = session ? (sessionImageSource(source as ImageURISource) as Source) : source;
      return <RNFastImage source={newSource} {...rest} />;
    } catch {
      return <UnavailableImage {...this.props} />;
    }
  }
}

export const enum ImageLoadingState {
  Loading,
  Success,
  Error,
}

export const typeConvertMap: Record<IMedia['type'], (FileMedia | EmbeddedMedia)['type']> = {
  audio: MediaType.AUDIO,
  document: MediaType.ATTACHMENT,
  image: MediaType.IMAGE,
  link: MediaType.EMBEDDED,
  video: MediaType.VIDEO,
};

export const convertToMedia = (data: IMedia[]): (FileMedia | EmbeddedMedia)[] =>
  data.map(item => ({
    alt: item.alt,
    mime: item.mime ?? 'application/octet-stream',
    src: item.src,
    type: typeConvertMap[item.type],
  }));
