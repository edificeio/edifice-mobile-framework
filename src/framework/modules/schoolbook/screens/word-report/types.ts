import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { SchoolbookNavigationParams, schoolbookRouteNames } from '~/framework/modules/schoolbook/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface ISchoolbookWordReportScreenDataProps {
  initialLoadingState: AsyncPagedLoadingState;
  session?: AuthLoggedAccount;
}
export interface SchoolbookWordReportScreenNavigationParams {
  schoolbookWordId: string;
}
export type SchoolbookWordReportScreenProps = ISchoolbookWordReportScreenDataProps &
  NativeStackScreenProps<SchoolbookNavigationParams, typeof schoolbookRouteNames.report>;
