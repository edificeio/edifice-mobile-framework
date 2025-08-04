import { SvgProps } from 'react-native-svg';

import { PictureProps } from '~/framework/components/picture';
import { ImageProps } from '~/framework/util/media';
import { AnyNavigableModuleConfig } from '~/framework/util/moduleTool';

export type ImageFallbackProps = Partial<PictureProps> &
  Pick<ModuleImageProps, 'iconSize' | 'moduleConfig'> & {
    imageProps: ImageProps;
    fallbackIcon?: ModuleImageProps['fallbackIcon'];
  };

export type ImageLoaderProps = Pick<ImageFallbackProps, 'imageProps'>;

export type ModuleConfigForFallbackImage = {
  displayPicture?: AnyNavigableModuleConfig['displayPicture'];
  displayColor?: Pick<Required<AnyNavigableModuleConfig>['displayColor'], 'pale' | 'regular'>;
};

export type ModuleImageProps = ImageProps & {
  moduleConfig?: ModuleConfigForFallbackImage;
  iconSize?: SvgProps['width'];
  fallbackIcon?: ModuleConfigForFallbackImage['displayPicture'];
};
