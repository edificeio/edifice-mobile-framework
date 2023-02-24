import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Session } from '~/framework/modules/viescolaire/common/utils/diary';
import type { DiaryNavigationParams } from '~/framework/modules/viescolaire/diary/navigation';

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
