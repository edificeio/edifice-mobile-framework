import { SvgProps } from 'react-native-svg';

import { PictureProps } from '~/framework/components/picture';
import { ImageProps } from '~/framework/util/media-deprecated';
import { IAppBadgeInfo } from '~/framework/util/moduleTool';

export type ImageFallbackProps = Partial<PictureProps> &
  Pick<ModuleImageProps, 'iconSize'> & {
    badge?: IAppBadgeInfo;
    fallbackIcon?: Partial<PictureProps>;
    imageProps: ImageProps;
  };

export type ImageLoaderProps = Pick<ImageFallbackProps, 'imageProps'>;

export type ModuleImageProps = ImageProps & {
  appName: string;
  fallbackIcon?: Partial<PictureProps>;
  iconSize?: SvgProps['width'];
};
