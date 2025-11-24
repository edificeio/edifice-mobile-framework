import { Moment } from 'moment';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { courseAdapter, homeworksAdapter, sessionAdapter } from '~/framework/modules/viescolaire/diary/service/adapters';
import { IBackendCourseList, IBackendHomeworkList, IBackendSessionList } from '~/framework/modules/viescolaire/diary/service/types';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

export const diaryService = {
  courses: {
    get: async (session: AuthActiveAccount, structureId: string, teacherId: string, startDate: Moment, endDate: Moment) => {
      const start = startDate.format('YYYY-MM-DD');
      const end = endDate.format('YYYY-MM-DD');
      const api = `/viescolaire/common/courses/${structureId}/${start}/${end}?teacherId=${teacherId}&union=true`;
      const courses = (await fetchJSONWithCache(api)) as IBackendCourseList;
      return courses.map(courseAdapter);
    },
  },
  homework: {
    updateProgress: async (session: AuthActiveAccount, homeworkId: number, isDone: boolean) => {
      const status = isDone ? 'done' : 'todo';
      const api = `/diary/homework/progress/${homeworkId}/${status}`;
      await fetchJSONWithCache(api, {
        method: 'POST',
      });
      return { homeworkId, status };
    },
  },
  homeworks: {
    get: async (session: AuthActiveAccount, structureId: string, startDate: string, endDate: string) => {
      const api = `/diary/homeworks/own/${startDate}/${endDate}/${structureId}`;
      const homeworks = (await fetchJSONWithCache(api)) as IBackendHomeworkList;
      return homeworksAdapter(homeworks);
    },
    getFromChild: async (session: AuthActiveAccount, childId: string, structureId: string, startDate: string, endDate: string) => {
      const api = `/diary/homeworks/child/${startDate}/${endDate}/${childId}/${structureId}`;
      const homeworks = (await fetchJSONWithCache(api)) as IBackendHomeworkList;
      return homeworksAdapter(homeworks);
    },
  },
  sessions: {
    get: async (session: AuthActiveAccount, structureId: string, startDate: string, endDate: string) => {
      const api = `/diary/sessions/own/${startDate}/${endDate}/${structureId}`;
      const sessions = (await fetchJSONWithCache(api)) as IBackendSessionList;
      return sessions.map(sessionAdapter);
    },
    getFromChild: async (session: AuthActiveAccount, childId: string, startDate: string, endDate: string) => {
      const api = `/diary/sessions/child/${startDate}/${endDate}/${childId}`;
      const sessions = (await fetchJSONWithCache(api)) as IBackendSessionList;
      return sessions.map(sessionAdapter);
    },
  },
};
