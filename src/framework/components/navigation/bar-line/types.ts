import type { ColorValue, ViewProps } from 'react-native';

export interface BarLineProps {
  bar: 'navBar' | 'tabBar';
  background: ColorValue;
  //don't forget to change the type when design provides svgs
  line?: ColorValue[];
  /** Forwarded to the painted view, the only place where a bar can be measured. */
  onLayout?: ViewProps['onLayout'];
}
