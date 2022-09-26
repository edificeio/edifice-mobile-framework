import moment from 'moment';

import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';
import { IHomework, IHomeworkMap, ISession } from '~/modules/viescolaire/diary/reducer';

type IBackendSubject = {
  id: string;
  externalId: string;
  name: string;
  rank?: number;
};

type IBackendAudience = {
  externalId: string;
  id: string;
  labels: string[];
  name: string;
};

type IBackendHomework = {
  audience_id: string;
  audience: IBackendAudience;
  color: string;
  created: string;
  description: string;
  due_date: string;
  estimatedtime: number;
  id: string;
  is_published: boolean;
  modified: string;
  owner_id: string;
  progress?: {
    created: string;
    homework_id: number;
    modified: string;
    state_id: number;
    state_label: string;
    user_id: string;
  };
  publish_date: string;
  session_id: string;
  structure_id: string;
  exceptional_label: string;
  subject_id: string;
  subject: IBackendSubject;
  teacher_id: string;
  type: {
    id: number;
    label: string;
    rank: number;
    structure_id: string;
  };
  type_id: number;
  workload: number;
};

type IBackendSessionHomework = {
  archive_school_year: string;
  audience: IBackendAudience;
  audience_id: string;
  color: string;
  created: string;
  description: string;
  due_date: string; // format 'YYYY-MM-DD'
  estimatedtime: number;
  exceptional_label: string;
  from_session_id: string;
  id: string;
  is_published: boolean;
  modified: string;
  owner_id: string;
  publish_date: string; // format 'YYYY-MM-DD'
  session_id: string;
  structure_id: string;
  subject: IBackendSubject;
  subject_id: string;
  teacher_id: string;
  type: {
    id: number;
    label: string;
    rank: number;
    structure_id: string;
  };
  type_id: number;
  workload: number;
};

type IBackendSession = {
  annotation: string;
  audience_id: string;
  audience: IBackendAudience;
  color: string;
  course_id: string;
  created: string;
  date: string;
  description: string;
  end_time: string;
  exceptional_label: string;
  homeworks: IBackendSessionHomework[];
  id: string;
  is_empty: boolean;
  is_published: boolean;
  modified: string;
  owner_id: string;
  room: string;
  start_time: string;
  structure_id: string;
  subject_id: string;
  subject: IBackendSubject;
  teacher_id: string;
  title: string;
  type_id: number;
};

type IBackendHomeworkList = IBackendHomework[];
type IBackendSessionList = IBackendSession[];

const homeworksAdapter = (data: IBackendHomeworkList): IHomeworkMap => {
  const result = {} as IHomeworkMap;
  data.forEach(item => {
    result[item.id] = {
      id: item.id,
      is_published: item.is_published,
      due_date: moment(item.due_date),
      type: item.type,
      subject_id: item.subject_id,
      subject: item.subject,
      exceptional_label: item.exceptional_label,
      progress: item.progress,
      description: item.description,
      created_date: moment(item.created),
      audience: item.audience,
      session_id: item.session_id,
    } as IHomework;
  });
  return result;
};

const sessionAdapter = (data: IBackendSession): ISession => {
  return {
    id: data.id,
    is_published: data.is_published,
    is_empty: data.is_empty,
    date: moment(data.date),
    subject_id: data.subject_id,
    subject: data.subject,
    exceptional_label: data.exceptional_label,
    start_time: data.start_time,
    end_time: data.end_time,
    teacher_id: data.teacher_id,
    description: data.description,
    title: data.title,
    homeworks: data.homeworks,
    course_id: data.course_id,
    audience: data.audience,
  } as ISession;
};

export const diaryService = {
  homeworks: {
    get: async (session: IUserSession, structureId: string, startDate: string, endDate: string) => {
      const api = `/diary/homeworks/own/${startDate}/${endDate}/${structureId}`;
      const homeworks = (await fetchJSONWithCache(api)) as IBackendHomeworkList;
      return homeworksAdapter(homeworks);
    },
    getFromChild: async (session: IUserSession, childId: string, structureId: string, startDate: string, endDate: string) => {
      const api = `/diary/homeworks/child/${startDate}/${endDate}/${childId}/${structureId}`;
      const homeworks = (await fetchJSONWithCache(api)) as IBackendHomeworkList;
      return homeworksAdapter(homeworks);
    },
  },
  homework: {
    updateProgress: async (session: IUserSession, homeworkId: number, isDone: boolean) => {
      const status = isDone ? 'done' : 'todo';
      const api = `/diary/homework/progress/${homeworkId}/${status}`;
      await fetchJSONWithCache(api, {
        method: 'POST',
      });
      return { homeworkId, status };
    },
  },
  sessions: {
    get: async (session: IUserSession, structureId: string, startDate: string, endDate: string) => {
      const api = `/diary/sessions/own/${startDate}/${endDate}/${structureId}`;
      const sessions = (await fetchJSONWithCache(api)) as IBackendSessionList;
      return sessions.map(s => sessionAdapter(s)) as ISession[];
    },
    getFromChild: async (session: IUserSession, childId: string, startDate: string, endDate: string) => {
      const api = `/diary/sessions/child/${startDate}/${endDate}/${childId}`;
      const sessions = (await fetchJSONWithCache(api)) as IBackendSessionList;
      return sessions.map(s => sessionAdapter(s)) as ISession[];
    },
  },
};
