import type { ColorValue, Pressable, PressableProps, TextProps, ViewProps } from 'react-native';

import type { SvgIconName } from '../picture';

export interface BaseButtonCommonProps extends Omit<PressableProps, 'children' | 'style' | 'testID'> {
  loading?: boolean;
  PressableComponent?: typeof Pressable;
  contentColor: ColorValue;
  contentColorActive?: ColorValue;
  textStyle?: TextProps['style'];
  style?: ViewProps['style'];
  testID: NonNullable<PressableProps['testID']>;
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

export type SpecificButtonProps = Omit<BaseButtonProps, 'contentColor' | 'contentColorActive'>;

export type GhostButtonProps = SpecificButtonProps & { outline?: boolean };

export interface ButtonGroupProps {
  children?: React.ReactElement<BaseButtonProps>[];
}
