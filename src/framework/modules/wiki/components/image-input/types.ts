import { ImageSourcePropType, ImageStyle } from 'react-native';

import { AnyNavigableModuleConfig } from '~/framework/util/moduleTool';

export interface ImageInputProps {
  moduleConfig: AnyNavigableModuleConfig;
  moduleImageStyle?: ImageStyle;
  onChange: (value: ImageSourcePropType | undefined) => void;
  style?: ImageStyle;
  value: ImageSourcePropType | undefined;
}
