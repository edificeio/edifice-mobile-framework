import React from 'react';
import RN from 'react-native';

import { usePrevious } from '~/framework/hooks/previous';

import { ImageFallback } from './fallback';
import { ImagePlaceholder } from './placeholder';
import { ImageLoadingState, ImageProps } from './types';

/**
 * Image component proxy
 * @param props
 * @returns
 */

export const Image = ({
  fallback,
  iconSize,
  onError: _onError,
  onLoad: _onLoad,
  source,
  // ToDo: use thumbnail to inject searchParamns in source
  thumbnail: _thumbnail,
  ...props
}: ImageProps) => {
  const [loadingState, setLoadingState] = React.useState<ImageLoadingState>(
    source ? ImageLoadingState.Loading : ImageLoadingState.Error,
  );

  const onLoad = React.useCallback<NonNullable<ImageProps['onLoad']>>(
    e => {
      setLoadingState(ImageLoadingState.Success);
      _onLoad?.(e);
    },
    [_onLoad],
  );

  const onError = React.useCallback<NonNullable<ImageProps['onError']>>(
    e => {
      setLoadingState(ImageLoadingState.Error);
      _onError?.(e);
    },
    [_onError],
  );

  const previousSource = usePrevious(source);
  if (previousSource !== source) {
    setLoadingState(ImageLoadingState.Loading);
  }

  try {
    if (loadingState === ImageLoadingState.Error) throw loadingState;
    else
      return (
        <>
          <RN.Image {...props} source={source} onLoad={onLoad} onError={onError} />
          {loadingState === ImageLoadingState.Loading && <ImagePlaceholder {...props} />}
        </>
      );
  } catch {
    return <ImageFallback {...props} fallback={fallback} iconSize={iconSize} />;
  }
};
