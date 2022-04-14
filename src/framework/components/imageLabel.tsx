import * as React from 'react';
import { ColorValue, View } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { Icon } from './icon';
import { NamedSVG } from './picture';
import { TextSemiBold, TextSizeStyle } from './text';

export enum ImageType {
  svg,
  icon,
}

export interface ImageLabelProps {
  text: string;
  imageName: string;
  imageType: ImageType;
  color: ColorValue;
}

export const ImageLabel = ({ text, imageName, imageType, color }: ImageLabelProps) => {
  return (
    <View style={{ flexDirection: 'row' }}>
      <View
        style={{
          width: UI_SIZES.dimensions.width.medium,
          height: UI_SIZES.dimensions.height.medium,
          borderRadius: UI_SIZES.dimensions.width.medium / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: color,
        }}>
        {imageType === ImageType.icon ? (
          <Icon name={imageName} color={theme.color.text.inverse} size={10} />
        ) : imageType === ImageType.svg ? (
          <NamedSVG name={imageName} />
        ) : null}
      </View>
      <TextSemiBold numberOfLines={1} style={{ ...TextSizeStyle.Small, marginLeft: UI_SIZES.spacing.extraSmall, color }}>
        {text}
      </TextSemiBold>
    </View>
  );
};
