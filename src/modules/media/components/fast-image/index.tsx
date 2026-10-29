import React from 'react';

import RNFastImage, { type FastImageProps as RNFastImageProps, type Source } from '@d11/react-native-fast-image';

import { getActiveAccount } from '~/modules/auth/store/accounts';
import { type SignedSourceProps, signSource, useSignedSource } from '~/modules/media/source';

export type FastImageProps = RNFastImageProps & SignedSourceProps;

/**
 * Bridge of `FastImage`: same component, which signs its `source`. Use it (not `FastImage` itself) when the cache of FastImage
 * (`source.cache`, `priority`...) is useful: `Image` of this module uses the one of react-native.
 */
const FastImageBridge = ({ account, signed, source, ...props }: FastImageProps) => {
  const signedSource = useSignedSource(source, { account, signed });
  return <RNFastImage {...props} source={signedSource} />;
};
FastImageBridge.displayName = 'FastImage';

/**
 * Same as the static `preload` of FastImage, with the sources signed for the connected account.
 */
const preload = (sources: Source[], options?: SignedSourceProps) => {
  const account = options?.signed === false ? undefined : (options?.account ?? getActiveAccount());
  RNFastImage.preload(account ? sources.map(source => signSource(account, source)) : sources);
};

export const FastImage = Object.assign(FastImageBridge, {
  cacheControl: RNFastImage.cacheControl,
  clearDiskCache: RNFastImage.clearDiskCache,
  clearMemoryCache: RNFastImage.clearMemoryCache,
  preload,
  priority: RNFastImage.priority,
  resizeMode: RNFastImage.resizeMode,
  transition: RNFastImage.transition,
});
