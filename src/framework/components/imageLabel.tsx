import * as React from 'react';
import { ColorValue, View } from 'react-native';

import theme from '~/app/theme';

import { UI_SIZES } from './constants';
import { Icon } from './icon';
import { NamedSVG } from './picture';
import { SmallBoldText } from './text';

export enum ImageType {
  svg,
  icon,
}

export interface ImageLabelProps {
  text: string;
  imageName: string;
  imageType: ImageType;
  color: ColorValue;
  cachedSVG?: boolean;
}

export const ImageLabel = ({ text, imageName, imageType, color, cachedSVG }: ImageLabelProps) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <View
        style={{
          width: UI_SIZES.dimensions.width.mediumPlus,
          height: UI_SIZES.dimensions.height.mediumPlus,
          borderRadius: UI_SIZES.dimensions.width.mediumPlus / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: color,
        }}>
        {imageType === ImageType.icon ? (
          <Icon name={imageName} color={theme.ui.text.inverse} size={10} />
        ) : imageType === ImageType.svg ? (
          <NamedSVG
            width={UI_SIZES.dimensions.width.medium}
            height={UI_SIZES.dimensions.height.medium}
            cached={cachedSVG}
            name={imageName}
          />
        ) : null}
      </View>
      <SmallBoldText numberOfLines={1} style={{ marginLeft: UI_SIZES.spacing.tiny, color }}>
        {text}
      </SmallBoldText>
    </View>
  );
};
