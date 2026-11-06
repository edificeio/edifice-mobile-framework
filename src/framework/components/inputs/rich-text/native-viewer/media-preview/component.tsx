import * as React from 'react';

import { RichContentSegmentType } from '~/framework/components/inputs/rich-text/native-viewer/types';
import MediaButton from '~/framework/components/media/button';
import { MediaType } from '~/framework/modules/media';

import { MediaPreviewProps } from './types';

const MediaPreview = ({ onOpenLink, onOpenMedia, segment }: Readonly<MediaPreviewProps>) => {
  const { src, type } = segment;
  const onPreviewPress = React.useCallback(
    () => (type === RichContentSegmentType.IFRAME ? onOpenLink(src) : onOpenMedia(src)),
    [onOpenLink, onOpenMedia, src, type],
  );
  const source = React.useMemo(() => ({ uri: src }), [src]);
  const posterUri = segment.type === RichContentSegmentType.VIDEO ? segment.posterUri : undefined;
  const posterSource = React.useMemo(() => (posterUri ? { uri: posterUri } : undefined), [posterUri]);

  switch (segment.type) {
    case RichContentSegmentType.VIDEO:
      return (
        <MediaButton
          type={MediaType.VIDEO}
          source={source}
          posterSource={posterSource}
          ratio={segment.ratio}
          onPreviewPress={onPreviewPress}
          referer={undefined}
        />
      );
    case RichContentSegmentType.AUDIO:
      return <MediaButton type={MediaType.AUDIO} source={source} onPreviewPress={onPreviewPress} referer={undefined} />;
    case RichContentSegmentType.IFRAME:
      return <MediaButton type={MediaType.EMBEDDED} source={source} onPreviewPress={onPreviewPress} referer={undefined} />;
    default:
      return null;
  }
};

export default React.memo(MediaPreview);
