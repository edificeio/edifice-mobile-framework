import { Animated } from 'react-native';

import type RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';

export interface RichToolbarProps {
  editor?: RichEditor;
  showBottomSheet: (type: 'image' | 'video') => void;
}

export interface RichToolbarState {
  selectedItems: string[];
  animatedValueEnter: Animated.Value;
  animatedValueExit: Animated.Value;
  animatedValueOpacityExit: Animated.Value;
  animatedValueOpacityEnter: Animated.Value;
}
