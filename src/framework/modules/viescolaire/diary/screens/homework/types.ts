import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Homework } from '~/framework/modules/viescolaire/common/utils/diary';
import type { DiaryNavigationParams } from '~/framework/modules/viescolaire/diary/navigation';

export interface DiaryHomeworkScreenProps {}

export interface DiaryHomeworkScreenNavParams {
  diaryTitle?: string;
  homework?: Homework;
  homeworkList?: Homework[];
  subject?: string;
}

export interface DiaryHomeworkScreenPrivateProps
  extends NativeStackScreenProps<DiaryNavigationParams, 'homework'>,
    DiaryHomeworkScreenProps {
  // @scaffolder add HOC props here
}
