import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { IUser } from '~/framework/modules/auth/model';
import type { UserType } from '~/framework/modules/auth/service';
import type { IClassGroups } from '~/framework/modules/viescolaire/common/model';
import type {
  fetchEdtClassGroupsAction,
  fetchEdtCoursesAction,
  fetchEdtSlotsAction,
  fetchEdtTeacherCoursesAction,
  fetchEdtTeachersAction,
  fetchEdtUserChildrenAction,
} from '~/framework/modules/viescolaire/edt/actions';
import type { IEdtCourse, ISlot, IUserChild } from '~/framework/modules/viescolaire/edt/model';
import type { EdtNavigationParams, edtRouteNames } from '~/framework/modules/viescolaire/edt/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface EdtHomeScreenProps {
  initialLoadingState: AsyncPagedLoadingState;
}

export interface EdtHomeScreenNavParams {}

export interface EdtHomeScreenStoreProps {
  courses: IEdtCourse[];
  slots: ISlot[];
  teachers: IUser[];
  childId?: string;
  classes?: string[];
  structureId?: string;
  userId?: string;
  userType?: UserType;
}

export interface EdtHomeScreenDispatchProps {
  tryFetchClassGroups: (...args: Parameters<typeof fetchEdtClassGroupsAction>) => Promise<IClassGroups[]>;
  tryFetchCourses: (...args: Parameters<typeof fetchEdtCoursesAction>) => Promise<IEdtCourse[]>;
  tryFetchSlots: (...args: Parameters<typeof fetchEdtSlotsAction>) => Promise<ISlot[]>;
  tryFetchTeacherCourses: (...args: Parameters<typeof fetchEdtTeacherCoursesAction>) => Promise<IEdtCourse[]>;
  tryFetchTeachers: (...args: Parameters<typeof fetchEdtTeachersAction>) => Promise<IUser[]>;
  tryFetchUserChildren: (...args: Parameters<typeof fetchEdtUserChildrenAction>) => Promise<IUserChild[]>;
}

export type EdtHomeScreenPrivateProps = EdtHomeScreenProps &
  EdtHomeScreenStoreProps &
  EdtHomeScreenDispatchProps &
  NativeStackScreenProps<EdtNavigationParams, typeof edtRouteNames.home>;
