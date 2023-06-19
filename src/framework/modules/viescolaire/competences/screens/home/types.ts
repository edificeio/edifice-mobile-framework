import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ITerm } from '~/framework/modules/viescolaire/common/model';
import type {
  fetchCompetencesAveragesAction,
  fetchCompetencesDevoirsAction,
  fetchCompetencesSubjectsAction,
  fetchCompetencesTermsAction,
  fetchCompetencesUserChildrenAction,
} from '~/framework/modules/viescolaire/competences/actions';
import type { IAverage, IDevoir, ISubject, IUserChild } from '~/framework/modules/viescolaire/competences/model';
import type { CompetencesNavigationParams, competencesRouteNames } from '~/framework/modules/viescolaire/competences/navigation';
import type { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface CompetencesHomeScreenProps {
  dropdownItems: {
    terms: { label: string; value: string }[];
    subjects: { label: string; value: string }[];
  };
  initialLoadingState: AsyncPagedLoadingState;
}

export interface CompetencesHomeScreenNavParams {}

export interface CompetencesHomeScreenStoreProps {
  averages: IAverage[];
  devoirs: IDevoir[];
  subjects: ISubject[];
  childId?: string;
  classes?: string[];
  structureId?: string;
  userChildren?: IUserChild[];
  userType?: string;
  userId?: string;
}

export interface CompetencesHomeScreenDispatchProps {
  handleClearCompetences: () => void;
  tryFetchAverages: (...args: Parameters<typeof fetchCompetencesAveragesAction>) => Promise<IAverage[]>;
  tryFetchDevoirs: (...args: Parameters<typeof fetchCompetencesDevoirsAction>) => Promise<IDevoir[]>;
  tryFetchSubjects: (...args: Parameters<typeof fetchCompetencesSubjectsAction>) => Promise<ISubject[]>;
  tryFetchTerms: (...args: Parameters<typeof fetchCompetencesTermsAction>) => Promise<ITerm[]>;
  tryFetchUserChildren: (...args: Parameters<typeof fetchCompetencesUserChildrenAction>) => Promise<IUserChild[]>;
}

export type CompetencesHomeScreenPrivateProps = CompetencesHomeScreenProps &
  CompetencesHomeScreenStoreProps &
  CompetencesHomeScreenDispatchProps &
  NativeStackScreenProps<CompetencesNavigationParams, typeof competencesRouteNames.home>;
