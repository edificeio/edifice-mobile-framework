import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

import { SchoolbookNavigationParams, schoolbookRouteNames } from '../../navigation';

export interface ISchoolbookWordReportScreenDataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session: ISession | undefined;
}
export interface SchoolbookWordReportScreenNavigationParams {
  schoolbookWordId: string;
}
export type SchoolbookWordReportScreenProps = ISchoolbookWordReportScreenDataProps &
  NativeStackScreenProps<SchoolbookNavigationParams, typeof schoolbookRouteNames.report>;
