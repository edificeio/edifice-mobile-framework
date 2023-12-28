import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Homework } from '~/framework/modules/viescolaire/common/utils/diary';
import type { DiaryNavigationParams, diaryRouteNames } from '~/framework/modules/viescolaire/diary/navigation';

export interface DiaryHomeworkScreenProps {}

export interface DiaryHomeworkScreenNavParams {
  diaryTitle?: string;
  homework?: Homework;
  homeworkList?: Homework[];
  subject?: string;
}

export interface DiaryHomeworkScreenStoreProps {}

export interface DiaryHomeworkScreenDispatchProps {}

export type DiaryHomeworkScreenPrivateProps = DiaryHomeworkScreenProps &
  DiaryHomeworkScreenStoreProps &
  DiaryHomeworkScreenDispatchProps &
  NativeStackScreenProps<DiaryNavigationParams, typeof diaryRouteNames.homework>;
