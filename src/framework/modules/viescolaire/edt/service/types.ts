export type IBackendClass = {
  notEmptyClass: boolean;
  name: string;
  externalId: string;
  id: string;
  source: string;
  type_groupe: number;
  color: string;
};

export type IBackendCourse = {
  _id: string;
  structureId: string;
  subjectId: string;
  teacherIds: string[];
  tagIds: number[];
  classes: string[];
  classesExternalIds: string[];
  groups: string[];
  groupsExternalIds: string[];
  roomLabels?: string[];
  dayOfWeek: number;
  manual: boolean;
  theoretical: boolean;
  updated: string;
  lastUser: string;
  recurrence: string;
  idStartSlot: string;
  idEndSlot: string;
  startDate: string;
  endDate: string;
  subject: {
    id: string;
    code: string;
    externalId: string;
    name: string;
    rank: number;
  };
  color: string;
  is_periodic: boolean;
  startCourse: string;
  endCourse: string;
  tags: {
    id: number;
    structureId: string;
    label: string;
    abbreviation: string;
    isPrimary: boolean;
    allowRegister: boolean;
    isHidden: boolean;
    isUsed: boolean;
    createdAt: string;
  }[];
};

export type IBackendSlot = {
  name: string;
  startHour: string;
  endHour: string;
  id: string;
};

export type IBackendUserChild = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  classes: string[];
  idClasses: string[];
  structures: {
    id: string;
    name: string;
  }[];
};

export type IBackendClassList = IBackendClass[];
export type IBackendCourseList = IBackendCourse[];
export type IBackendSlotList = IBackendSlot[];
export type IBackendUserChildren = IBackendUserChild[];
