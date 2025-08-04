import { ImageProps } from '~/framework/util/media';

export type ImageWithFallbackProps = ImageProps & {
  Fallback?: React.ComponentType<ImageProps> | React.ReactElement;
};
