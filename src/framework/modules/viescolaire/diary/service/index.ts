import moment, { Moment } from 'moment';

import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { IDiaryCourse, IDiarySession, IHomework, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

type IBackendCourse = {
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

type IBackendAudience = {
  id: string;
  externalId: string | null;
  name: string;
  labels: string[];
};

type IBackendSubject = {
  id: string;
  externalId: string;
  name: string;
  rank: number;
};

type IBackendTeacher = {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  info: string | null;
};

type IBackendHomework = {
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

type IBackendSession = {
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

type IBackendCourseList = IBackendCourse[];
type IBackendHomeworkList = IBackendHomework[];
type IBackendSessionList = IBackendSession[];

const homeworkAdapter = (data: IBackendHomework): IHomework => {
  return {
    audience: data.audience,
    created_date: moment(data.created),
    description: data.description,
    due_date: moment(data.due_date),
    exceptional_label: data.exceptional_label,
    id: data.id.toString(),
    is_published: data.is_published,
    progress: data.progress,
    session_id: data.session_id?.toString() ?? null,
    subject: data.subject,
    subject_id: data.subject_id,
    type: data.type,
  };
};

const courseAdapter = (data: IBackendCourse): IDiaryCourse => {
  return {
    classes: data.classes,
    color: data.color,
    endDate: moment(data.endDate),
    groups: data.groups,
    id: data._id,
    roomLabels: data.roomLabels,
    startDate: moment(data.startDate),
    subject: data.subject,
    subjectId: data.subjectId,
    teacherIds: data.teacherIds,
  };
};

const homeworksAdapter = (data: IBackendHomeworkList): IHomeworkMap => {
  const homeworks = {} as IHomeworkMap;

  for (const homework of data) {
    homeworks[homework.id] = homeworkAdapter(homework);
  }
  return homeworks;
};

const sessionAdapter = (data: IBackendSession): IDiarySession => {
  return {
    audience: data.audience,
    course_id: data.course_id,
    date: moment(data.date),
    description: data.description,
    end_time: data.end_time,
    exceptional_label: data.exceptional_label,
    homeworks: data.homeworks.map(homeworkAdapter),
    id: data.id.toString(),
    is_empty: data.is_empty,
    is_published: data.is_published,
    start_time: data.start_time,
    subject: data.subject,
    subject_id: data.subject_id,
    teacher_id: data.teacher_id,
    title: data.title,
  };
};

export const diaryService = {
  courses: {
    get: async (session: AuthLoggedAccount, structureId: string, teacherId: string, startDate: Moment, endDate: Moment) => {
      const start = startDate.format('YYYY-MM-DD');
      const end = endDate.format('YYYY-MM-DD');
      const api = `/viescolaire/common/courses/${structureId}/${start}/${end}?teacherId=${teacherId}&union=true`;
      const courses = (await fetchJSONWithCache(api)) as IBackendCourseList;
      return courses.map(courseAdapter);
    },
  },
  homework: {
    updateProgress: async (session: AuthLoggedAccount, homeworkId: number, isDone: boolean) => {
      const status = isDone ? 'done' : 'todo';
      const api = `/diary/homework/progress/${homeworkId}/${status}`;
      await fetchJSONWithCache(api, {
        method: 'POST',
      });
      return { homeworkId, status };
    },
  },
  homeworks: {
    get: async (session: AuthLoggedAccount, structureId: string, startDate: string, endDate: string) => {
      const api = `/diary/homeworks/own/${startDate}/${endDate}/${structureId}`;
      const homeworks = (await fetchJSONWithCache(api)) as IBackendHomeworkList;
      return homeworksAdapter(homeworks);
    },
    getFromChild: async (session: AuthLoggedAccount, childId: string, structureId: string, startDate: string, endDate: string) => {
      const api = `/diary/homeworks/child/${startDate}/${endDate}/${childId}/${structureId}`;
      const homeworks = (await fetchJSONWithCache(api)) as IBackendHomeworkList;
      return homeworksAdapter(homeworks);
    },
  },
  sessions: {
    get: async (session: AuthLoggedAccount, structureId: string, startDate: string, endDate: string) => {
      const api = `/diary/sessions/own/${startDate}/${endDate}/${structureId}`;
      const sessions = (await fetchJSONWithCache(api)) as IBackendSessionList;
      return sessions.map(sessionAdapter);
    },
    getFromChild: async (session: AuthLoggedAccount, childId: string, startDate: string, endDate: string) => {
      const api = `/diary/sessions/child/${startDate}/${endDate}/${childId}`;
      const sessions = (await fetchJSONWithCache(api)) as IBackendSessionList;
      return sessions.map(sessionAdapter);
    },
  },
};
