import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Session } from '~/framework/modules/viescolaire/common/utils/diary';
import type { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';

export interface DiarySessionScreenProps {}

export interface DiarySessionScreenNavParams {
  session?: Session;
  sessionList?: Session[];
}

export interface DiarySessionScreenStoreProps {}

export interface DiarySessionScreenDispatchProps {}

export type DiarySessionScreenPrivateProps = DiarySessionScreenProps &
  DiarySessionScreenStoreProps &
  DiarySessionScreenDispatchProps &
  NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.session>;
