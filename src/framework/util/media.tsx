import * as React from 'react';
import { ImageProps, ImageURISource, Image as RNImage } from 'react-native';
import { FastImageProps, default as RNFastImage } from 'react-native-fast-image';

import { urlSigner } from '~/infra/oauth';

interface IMediaCommonAttributes {
  src: string | ImageURISource;
  link?: string;
  alt?: string;
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

export type IMedia = IImageMedia | IVideoMedia | IAudioMedia;

export function formatSource(src: string | ImageURISource) {
  return typeof src === 'string' ? { uri: src } : src;
}
export function formatMediaSource(media: IMediaCommonAttributes) {
  return { ...media, src: formatSource(media.src) };
}
export function formatMediaSourceArray(medias: IMediaCommonAttributes[]) {
  return medias.map(m => formatMediaSource(m));
}

export class Image extends React.PureComponent<ImageProps> {
  render() {
    const { source, ...rest } = this.props;
    const hasSource = typeof source === 'object' ? (source as ImageURISource).uri !== undefined : true;
    return <RNImage source={hasSource ? urlSigner.signURISource(source) : undefined} {...rest} />;
  }
}
export class FastImage extends React.PureComponent<FastImageProps> {
  render() {
    const { source, ...rest } = this.props;
    const hasSource = typeof source === 'object' ? (source as ImageURISource).uri !== undefined : true;
    return <RNFastImage source={hasSource ? urlSigner.signURISource(source) : undefined} {...rest} />;
  }
}
