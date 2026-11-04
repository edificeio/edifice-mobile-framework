import { SvgProps } from 'react-native-svg';

import { PictureProps } from '~/framework/components/picture';
import { ImageProps } from '~/framework/util/media-deprecated';
import { IAppBadgeInfo } from '~/framework/util/moduleTool';

export type ImageFallbackProps = Partial<PictureProps> &
  Pick<EntAppImageProps, 'iconSize'> & {
    badge?: IAppBadgeInfo;
    fallbackIcon?: Partial<PictureProps>;
    imageProps: ImageProps;
  };

export type ImageLoaderProps = Pick<ImageFallbackProps, 'imageProps'>;

export type EntAppImageProps = ImageProps & {
  /** The app (its name in the ENT) whose colors and icon are shown when there is no image. Unknown: the default ones. */
  entAppName: string | undefined;
  fallbackIcon?: Partial<PictureProps>;
  iconSize?: SvgProps['width'];
};
