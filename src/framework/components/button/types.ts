import type { ColorValue, Pressable, PressableProps, TextProps, ViewProps } from 'react-native';

import type { SvgIconName } from '../picture';

export interface BaseButtonCommonProps extends Omit<PressableProps, 'children'> {
  loading?: boolean;
  PressableComponent?: typeof Pressable;
  contentColor: ColorValue;
  contentColorActive?: ColorValue;
  textStyle?: TextProps['style'];
}

interface BaseTextButtonProps extends BaseButtonCommonProps {
  text: string;
  iconLeft?: SvgIconName;
  iconRight?: SvgIconName;
  TextComponent?: React.ComponentType<TextProps>;
}

interface BaseIconButtonProps extends BaseButtonCommonProps {
  icon: SvgIconName;
  activeStyle?: ViewProps['style'];
}

export type BaseButtonProps = Partial<BaseTextButtonProps> & Partial<BaseIconButtonProps> & BaseButtonCommonProps;

export type SpecificButtonProps = Omit<BaseButtonProps, 'contentColor'>;

export type GhostButtonProps = SpecificButtonProps & { outline?: boolean };

export interface ButtonGroupProps {
  children?: React.ReactElement<BaseButtonProps>[];
}
