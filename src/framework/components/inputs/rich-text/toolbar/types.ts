import { Animated } from 'react-native';

import type RichEditor from '~/framework/components/inputs/rich-text/editor/RichEditor';
import { IMedia } from '~/framework/util/media';

export interface RichToolbarProps {
  editor?: RichEditor;
  showBottomSheet: (type: 'image' | 'video') => void;
  onPromptMedia: (type: IMedia['type']) => void;
}

export interface RichToolbarState {
  selectedItems: string[];
  animatedValueEnter: Animated.Value;
  animatedValueExit: Animated.Value;
  animatedValueOpacityExit: Animated.Value;
  animatedValueOpacityEnter: Animated.Value;
}
