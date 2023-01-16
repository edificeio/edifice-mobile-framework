/**
 * Picture
 *
 * A unique component for displaying image from various technologies.
 */
import * as React from 'react';
import { ImageProps } from 'react-native';

import { Image } from '~/framework/util/media';

import { Icon, IconProps } from './Icon';
import NamedSVG, { NamedSVGProps } from './NamedSVG';

export interface IAnyPictureSource {
  source: any;
}

interface IPictureIcon extends IconProps {
  type: 'Icon';
}
interface IPictureImage extends ImageProps {
  type: 'Image';
}
interface IPictureNamedSvg extends NamedSVGProps {
  type: 'NamedSvg';
}

export type PictureProps = IPictureIcon | IPictureImage | IPictureNamedSvg;

export function Picture(props: PictureProps) {
  const { type, ...rest } = props;
  switch (type) {
    case 'Icon':
      return <Icon {...(rest as IconProps)} />;
    case 'Image':
      return <Image {...(rest as ImageProps)} />;
    case 'NamedSvg':
      return <NamedSVG {...(rest as NamedSVGProps)} />;
  }
}

export * from './Icon';
export * from './NamedSVG';
