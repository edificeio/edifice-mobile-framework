import moment from "moment";

import { Me } from "../../infra/Me";

import { actionTypeLogin, actionTypeLogout } from "../actions/login";

// TYPE DEFINITIONS -------------------------------------------------------------------------------

export interface IUserInfoState {
  address?: string;
  administrativeStructures?: Array<{ id: string }>;
  birthdate?: moment.Moment;
  blocked?: boolean;
  checksum?: string;
  children?: Array<{ displayName: string; externalId: string; id: string }>;
  classCategories?: string[];
  classes?: string[];
  displayName?: string;
  email?: string;
  emailAcademy?: string;
  externalId?: string;
  firstName?: string;
  functionalGroups?: Array<{ id: string; name: string }>;
  functions?: any[];
  groups?: any[];
  homePhone?: string;
  health?: string;
  hobbies?: Array<{ category: string; values: string; visibility: string }>;
  joinKey?: string[];
  lastDomain?: string;
  lastLogin?: moment.Moment;
  lastName?: string;
  modified?: moment.Moment;
  modules?: string[];
  mood?: string;
  motto?: string;
  parents?: Array<{ displayName: string; externalId: string; id: string }>;
  photo?: string;
  profiles?: string[];
  relatedId?: string;
  relatedName?: string;
  relatedType?: string;
  schools?: Array<{ classes: string[]; name: string }>;
  source?: string;
  structureNodes?: any[];
  structures?: string[];
  subjectTaught?: string[];
  surname?: string;
  teaches?: boolean;
  tel?: string;
  type?: string[];
  visibleInfos?: string[];
}

// THE REDUCER ------------------------------------------------------------------------------------

const stateDefault: IUserInfoState = {};

const infoReducer = (state: IUserInfoState = stateDefault, action) => {
  switch (action.type) {
    case actionTypeLogin:
      const session = {
        ...action.userdata,
        ...action.userbook,
        birthdate: moment(action.userbook.birthdate),
        lastLogin: moment(action.userdata.lastLogin),
        modified: moment(action.userdata.modified)
      };
      Me.session = session;
      return session;
    case actionTypeLogout:
      return stateDefault;
    default:
      return state;
  }
};

export default infoReducer;
