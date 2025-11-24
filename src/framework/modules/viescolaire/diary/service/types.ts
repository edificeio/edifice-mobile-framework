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
  roomLabels: string[];
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
};

export type IBackendAudience = {
  id: string;
  externalId: string | null;
  name: string;
  labels: string[];
};

export type IBackendSubject = {
  id: string;
  externalId: string;
  name: string;
  rank: number;
};

export type IBackendTeacher = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  info: string | null;
};

export type IBackendHomework = {
  id: number;
  subject_id: string;
  structure_id: string;
  teacher_id: string;
  audience_id: string;
  color: string;
  description: string;
  is_published: boolean;
  session_id: number | null;
  due_date: string; // YYYY-MM-DD
  type_id: number;
  workload: number;
  owner_id: string;
  created: string;
  modified: string;
  estimatedtime: number;
  publish_date: string; // YYYY-MM-DD
  from_session_id: number | null;
  exceptional_label: string | null;
  archive_school_year: string | null;
  type: {
    id: number;
    structure_id: string;
    label: string;
    rank: number;
  };
  progress: {
    user_id: string;
    homework_id: number;
    state_id: number;
    created: string;
    modified: string;
    state_label: string;
  } | null;
  subject: IBackendSubject;
  teacher: IBackendTeacher;
  audience: IBackendAudience;
};

export type IBackendSession = {
  id: number;
  subject_id: string;
  structure_id: string;
  teacher_id: string;
  audience_id: string;
  title: string;
  room: string;
  color: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  annotation: string;
  is_published: boolean;
  course_id: string;
  owner_id: string;
  created: string;
  modified: string;
  type_id: number | null;
  is_empty: boolean;
  exceptional_label: string | null;
  archive_school_year: string | null;
  homeworks: IBackendHomework[];
  subject: IBackendSubject;
  teacher: IBackendTeacher;
  audience: IBackendAudience;
};

export type IBackendCourseList = IBackendCourse[];
export type IBackendHomeworkList = IBackendHomework[];
export type IBackendSessionList = IBackendSession[];
