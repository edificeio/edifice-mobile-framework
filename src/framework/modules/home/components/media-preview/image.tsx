import * as React from 'react';

import RNFastImage, { FastImageProps, Source } from '@d11/react-native-fast-image';

import { ImageFallback } from '~/framework/modules/media/components/image/fallback';
import { ImagePlaceholder } from '~/framework/modules/media/components/image/placeholder';

import { PreviewImageProps } from './types';

export const PreviewImage = ({ source, style }: PreviewImageProps) => {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const onLoad = React.useCallback(() => setLoaded(true), []);
  const onError = React.useCallback(() => setFailed(true), []);

  if (failed || !source) return <ImageFallback style={style} />;

  return (
    <>
      <RNFastImage
        source={source as Source}
        style={style as FastImageProps['style']}
        resizeMode="cover"
        onLoad={onLoad}
        onError={onError}
      />
      {loaded ? null : <ImagePlaceholder style={style} />}
    </>
  );
};
