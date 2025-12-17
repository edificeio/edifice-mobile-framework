import { ImageRequireSource, ImageSourcePropType, ImageURISource } from 'react-native';

import { ReactVideoSourceProperties } from 'react-native-video';
import { WebViewSourceUri } from 'react-native-webview/lib/WebViewTypes';

import { Media } from './types';

export function isRequireSource(input: ImageSourcePropType): input is ImageRequireSource {
  return typeof input === 'number';
}

export const toURISource = <SourceType extends ImageURISource | ReactVideoSourceProperties | WebViewSourceUri>(
  src: Media['src'],
): typeof src extends undefined ? undefined : Pick<SourceType, 'uri'> =>
  src instanceof URL ? { uri: src.href } : typeof src === 'string' ? { uri: src } : src;

export const toImageURISourceArray = (srcs: Media['src'][]) => srcs.map(toURISource);

export const injectImageSource = (input: ImageSourcePropType, init: ImageURISource) => {
  if (isRequireSource(input)) return input;
  if (Array.isArray(input)) return input.map(i => ({ ...i, ...init }) as ImageURISource);
  else return { ...input, ...init } as ImageURISource;
};
