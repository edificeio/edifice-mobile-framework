import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ISession } from '~/framework/modules/auth/model';
import { SchoolbookNavigationParams, schoolbookRouteNames } from '~/framework/modules/schoolbook/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface ISchoolbookWordReportScreenDataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session: ISession | undefined;
}
export interface SchoolbookWordReportScreenNavigationParams {
  schoolbookWordId: string;
}
export type SchoolbookWordReportScreenProps = ISchoolbookWordReportScreenDataProps &
  NativeStackScreenProps<SchoolbookNavigationParams, typeof schoolbookRouteNames.report>;
