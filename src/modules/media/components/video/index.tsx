import React from 'react';

import RNVideo, { type ReactVideoProps, type VideoRef } from 'react-native-video';

import { type SignedSourceProps, useSignedSource } from '~/modules/media/source';

export type { VideoRef };
export type VideoProps = ReactVideoProps & SignedSourceProps & { ref?: React.Ref<VideoRef> };

/**
 * Bridge of `Video` of react-native-video (it plays audio too): same component, which signs its `source`.
 */
export const Video = ({ account, signed, source, ...props }: VideoProps) => {
  const signedSource = useSignedSource(source, { account, signed });
  return <RNVideo {...props} source={signedSource} />;
};
