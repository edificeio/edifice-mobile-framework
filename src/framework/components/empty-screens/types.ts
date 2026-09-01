import { TextProps, ViewProps } from 'react-native';

import { SvgIconName } from '~/framework/components/picture';

export interface EmptyContentButtonProps {
  action: () => void;
  icon?: SvgIconName;
  text: string;
}

export interface EmptyContentProps {
  button?: EmptyContentButtonProps;
  extraStyle?: ViewProps['style'];
  svg: SvgIconName;
  svgHeight?: number;
  svgWidth?: number;
  title?: TextProps['children'];
  text?: TextProps['children'];
}
