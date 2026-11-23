import type * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface AudienceBarProps {
  /** Shown under the counters: the react button. */
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  /** Shows the views (managers of the resource only). */
  isManager?: boolean;
  nbComments?: number;
  nbViews?: number;
  onPressReactions: () => void;
  onPressViews: () => void;
  /** Nothing can be pressed. */
  preview?: boolean;
  /** The reaction types given to the resource. */
  reactionTypes: string[];
  showComments?: boolean;
  totalReactions?: number;
  userReaction: string | null;
  /** The valid reaction types of the platform: a skeleton is shown until they are known. */
  validReactionTypes: string[] | undefined;
}
