/**
 * Vie Scolaire Reducer
 */

/* eslint-disable flowtype/no-types-missing-file-annotation */
import { combineReducers } from "redux";

import cdt from "./cdt/reducers";
import { IHomeworkListState } from "./cdt/state/homeworks";
import { ISessionListState } from "./cdt/state/sessions";
import competences from "./competences/reducers";
import { ILevelsListState } from "./competences/state/competencesLevels";
import { IDevoirListState } from "./competences/state/devoirs";
import { IMatiereListState } from "./competences/state/matieres";
import { IMoyenneListState } from "./competences/state/moyennes";
import { IServiceListState } from "./competences/state/servicesMatieres";
import { IStructureMatiereListState } from "./competences/state/structureMatieres";
import edt from "./edt/reducers";
import { ICourseListState } from "./edt/state/courses";
import { ISlotListState } from "./edt/state/slots";
import presences from "./presences/reducers";
import { IClassesCallListState } from "./presences/state/teacherClassesCall";
import { ICoursesRegisterInfosState } from "./presences/state/teacherCourseRegister";
import { ICoursesListState } from "./presences/state/teacherCourses";
import viesco from "./viesco/reducers";
import { IGroupListState } from "./viesco/state/group";
import { IPeriodsListState, IYearState } from "./viesco/state/periods";
import { IPersonnelListState } from "./viesco/state/personnel";
import { ISubjectListState } from "./viesco/state/subjects";

// State

export interface IViesco_State {
  viesco: {
    subjectsList: ISubjectListState;
    personnelList: IPersonnelListState;
    children: any;
    structure: any;
    periods: IPeriodsListState;
    year: IYearState;
    group: IGroupListState;
  };
  cdt: {
    homeworksList: IHomeworkListState;
    sessionsList: ISessionListState;
  };
  edt: {
    coursesList: ICourseListState;
    slotsList: ISlotListState;
  };
  presences: {
    coursesList: ICoursesListState;
    callList: IClassesCallListState;
    coursesRegister: ICoursesRegisterInfosState;
    history: any;
  };
  competences: {
    levels: ILevelsListState;
    devoirsList: IDevoirListState;
    matieres: IMatiereListState;
    moyennesList: IMoyenneListState;
    serviceList: IServiceListState;
    structureMatiereList: IStructureMatiereListState;
  };
}

// Reducer

export default combineReducers({ viesco, cdt, edt, presences, competences });

// Getters
