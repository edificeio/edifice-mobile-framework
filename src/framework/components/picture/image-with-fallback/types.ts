import { ImageProps } from '~/framework/util/media-deprecated';

export type ImageWithFallbackProps = ImageProps & {
  Fallback?: React.ComponentType<ImageProps> | React.ReactElement;
};
