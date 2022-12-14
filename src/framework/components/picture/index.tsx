/**
 * Picture
 *
 * A unique component for displaying image from various technologies.
 */
import * as React from 'react';
import { ImageProps } from 'react-native';

import NamedSVG, { NamedSVGProps } from './NamedSVG';
import { Icon, IconProps } from './Icon';
import { Image } from '~/framework/util/media';

export interface IAnyPictureSource {
  source: any;
}

interface IPicture_Icon extends IconProps {
  type: 'Icon';
}
interface IPicture_Image extends ImageProps {
  type: 'Image';
}
interface IPicture_NamedSvg extends NamedSVGProps {
  type: 'NamedSvg';
}

export type PictureProps = IPicture_Icon | IPicture_Image | IPicture_NamedSvg;

export function Picture(props: PictureProps) {
  const { type, ...rest } = props;
  switch (type) {
    case 'Icon': return <Icon {...(rest as IconProps)} />;
    case 'Image': return <Image {...(rest as ImageProps)} />;
    case 'NamedSvg': return <NamedSVG {...(rest as NamedSVGProps)} />;
  }
}

export * from './Icon';
export * from './NamedSVG';
