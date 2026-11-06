import * as React from 'react';
import { TouchableOpacity } from 'react-native';

import { Image } from '~/framework/modules/media';
import { sessionImageSource } from '~/framework/util/transport';

import { getImageStyle } from './styles';
import { ImagePreviewProps } from './types';

const ImagePreview = ({ declaredSize, onPress, src }: Readonly<ImagePreviewProps>) => {
  const source = React.useMemo(() => sessionImageSource({ uri: src }), [src]);
  const imageStyle = React.useMemo(() => getImageStyle(declaredSize), [declaredSize]);

  const onPressImage = React.useCallback(() => onPress(src), [onPress, src]);

  return (
    <TouchableOpacity onPress={onPressImage} testID="rich-content-image">
      <Image source={source} style={imageStyle} resizeMode="contain" />
    </TouchableOpacity>
  );
};

export default React.memo(ImagePreview);
