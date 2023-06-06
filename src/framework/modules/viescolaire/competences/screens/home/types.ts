import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ITerm } from '~/framework/modules/viescolaire/common/model';
import { IAverage, IDevoir, ISubject, IUserChild } from '~/framework/modules/viescolaire/competences/model';
import type { CompetencesNavigationParams } from '~/framework/modules/viescolaire/competences/navigation';
import { AsyncPagedLoadingState } from '~/framework/util/redux/asyncPaged';

export interface CompetencesHomeScreenProps {
  averages: IAverage[];
  devoirs: IDevoir[];
  dropdownItems: {
    terms: { label: string; value: string }[];
    subjects: { label: string; value: string }[];
  };
  initialLoadingState: AsyncPagedLoadingState;
  subjects: ISubject[];
  childId?: string;
  classes?: string[];
  structureId?: string;
  userChildren?: IUserChild[];
  userType?: string;
  userId?: string;
  fetchAverages: (structureId: string, studentId: string, termId?: string) => Promise<IAverage[]>;
  fetchDevoirs: (structureId: string, studentId: string) => Promise<IDevoir[]>;
  fetchSubjects: (structureId: string) => Promise<ISubject[]>;
  fetchTerms: (structureId: string, groupId: string) => Promise<ITerm[]>;
  fetchUserChildren: (structureId: string, userId: string) => Promise<IUserChild[]>;
}

export interface CompetencesHomeScreenNavParams {}

export interface CompetencesHomeScreenPrivateProps
  extends NativeStackScreenProps<CompetencesNavigationParams, 'home'>,
    CompetencesHomeScreenProps {
  // @scaffolder add HOC props here
}
