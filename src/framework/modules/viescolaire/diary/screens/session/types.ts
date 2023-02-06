import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { DiaryNavigationParams } from '~/framework/modules/viescolaire/diary/navigation';
import { Session } from '~/modules/viescolaire/utils/diary';

export interface DiarySessionScreenProps {}

export interface DiarySessionScreenNavParams {
  session?: Session;
  sessionList?: Session[];
}

export interface DiarySessionScreenPrivateProps
  extends NativeStackScreenProps<DiaryNavigationParams, 'session'>,
    DiarySessionScreenProps {
  // @scaffolder add HOC props here
}
