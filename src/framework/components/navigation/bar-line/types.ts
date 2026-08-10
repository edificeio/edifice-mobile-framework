import type { ColorValue } from 'react-native';

export interface BarLineProps {
  bar: 'navBar' | 'tabBar';
  background: ColorValue;
  //don't forget to change the type when design provides svgs
  line?: ColorValue[];
}
