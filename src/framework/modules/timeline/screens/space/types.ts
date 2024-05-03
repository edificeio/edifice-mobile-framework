import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ITimelineNavigationParams } from '~/framework/modules/timeline/navigation';

export interface TimelineSpaceScreenProps {}

export interface TimelineSpaceScreenNavParams {}

export interface TimelineSpaceScreenPrivateProps
  extends NativeStackScreenProps<ITimelineNavigationParams, 'space'>,
    TimelineSpaceScreenProps {}
