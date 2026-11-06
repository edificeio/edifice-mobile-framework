import * as React from 'react';
import { ImageLoadEvent, TouchableOpacity } from 'react-native';

import { useImageNaturalSize } from '~/framework/components/inputs/rich-text/native-viewer/hooks';
import { Image } from '~/framework/modules/media';
import { sessionImageSource } from '~/framework/util/transport';

import { getImageStyle } from './styles';
import { ImagePreviewProps } from './types';

const ImagePreview = ({ declaredSize, onPress, src }: Readonly<ImagePreviewProps>) => {
  const { naturalSize, onMeasured } = useImageNaturalSize(src, declaredSize);
  const source = React.useMemo(() => sessionImageSource({ uri: src }), [src]);
  const imageStyle = React.useMemo(() => getImageStyle(naturalSize), [naturalSize]);

  const onPressImage = React.useCallback(() => onPress(src), [onPress, src]);
  const onLoad = React.useCallback(({ nativeEvent }: ImageLoadEvent) => onMeasured(nativeEvent.source), [onMeasured]);

  return (
    <TouchableOpacity onPress={onPressImage} testID="rich-content-image">
      <Image source={source} style={imageStyle} resizeMode="contain" onLoad={onLoad} />
    </TouchableOpacity>
  );
};

export default React.memo(ImagePreview);
