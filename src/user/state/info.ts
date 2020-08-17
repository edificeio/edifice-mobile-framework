import moment from "moment";

// State Type

export interface IUserInfoState {
  address?: string;
  administrativeStructures?: Array<{ id: string }>;
  birthDate?: moment.Moment;
  blocked?: boolean;
  checksum?: string;
  children?: { [id: string]: { displayName: string; externalId: string } };
  childrenStructure?: Array<{
    structureName: string;
    children: Array<{ classNames: string[]; displayName: string; externalId: string; id: string }>;
  }>;
  classCategories?: string[];
  classes?: string[];
  displayName?: string;
  email?: string;
  emailAcademy?: string;
  externalId?: string;
  federated?: boolean;
  firstName?: string;
  functionalGroups?: Array<{ id: string; name: string }>;
  functions?: any[];
  groupsIds?: any[];
  homePhone?: string;
  health?: string;
  hobbies?: Array<{ category: string; values: string; visibility: string }>;
  id?: string;
  joinKey?: string[];
  lastDomain?: string;
  lastLogin?: moment.Moment;
  lastName?: string;
  login?: string;
  loginAlias?: string;
  mobile?: string;
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
  schools?: Array<{ classes: string[]; name: string; id: string }>;
  source?: string;
  structureNodes?: any[];
  structures?: string[];
  subjectTaught?: string[];
  surname?: string;
  teaches?: boolean;
  tel?: string;
  type?: string[] | string;
  visibleInfos?: string[];

  forceRefreshKey: number;
}

// Default state

export const initialState: IUserInfoState = {
  forceRefreshKey: 0,
};

// Action Types
