/**
 * Schoolbook services
 */
import moment from 'moment';

import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { IResourceUriCaptureFunction } from '~/framework/util/notifications';
import { IUserSession } from '~/framework/util/session';
import { fetchJSONWithCache, signedFetchJson } from '~/infra/fetchWithCache';
import { ISchoolbookWordReport } from '~/modules/schoolbook/reducer';

export interface IEntcoreSchoolbookWordResponse {
  id: number;
  owner: string;
  parentName: string;
  comment: string;
  modified: string;
}

export interface IEntcoreSchoolbookWordAcknowledgment {
  id: number;
  owner: string;
  parent_name: string;
}

export interface IEntcoreSchoolbookWordConcernedChild {
  owner: string;
  owner_name: string;
  responses: IEntcoreSchoolbookWordResponse[] | null;
  acknowledgments: IEntcoreSchoolbookWordAcknowledgment[];
}

export interface IEntcoreSchoolbookWord {
  id: number;
  title: string;
  text: string;
  sending_date: string;
  reply: boolean;
  category: string;
  owner_id: string;
  owner_name: string;
  shared: ({ userId?: string; groupId?: string } & any)[] | [];
}

export interface IEntcoreReportedSchoolbookWord extends IEntcoreSchoolbookWord {
  total: number;
  resp_number: number;
  ack_number: number;
}

export interface IEntcoreSchoolbookWordReport {
  word: IEntcoreReportedSchoolbookWord;
  report: IEntcoreSchoolbookWordConcernedChild[];
}

export interface IEntcoreTeacherWordList {
  //🟠rename?
  ack_number: number;
  category: string;
  id: number;
  owner_id: string;
  owner_name: string;
  reply: boolean;
  resp_number: number;
  sending_date: string;
  shared: {
    // 🟠improve?
    'fr-wseduc-schoolbook-controllers-SchoolBookController|deleteWord': boolean;
    'fr-wseduc-schoolbook-controllers-SchoolBookController|getWord': boolean;
    'fr-wseduc-schoolbook-controllers-SchoolBookController|print': boolean;
    'fr-wseduc-schoolbook-controllers-SchoolBookController|resend': boolean;
    'fr-wseduc-schoolbook-controllers-SchoolBookController|shareResource': boolean;
    'fr-wseduc-schoolbook-controllers-SchoolBookController|shareThread': boolean;
    'fr-wseduc-schoolbook-controllers-SchoolBookController|updateWord': boolean;
    'fr-wseduc-schoolbook-controllers-SchoolBookController|wordReport': boolean;
    userId: string;
  }[];
  text: string;
  title: string;
  total: number;
  //🟠add data for recepient names/id's (wait backend changes)
}
[];

export const schoolbookWordReportAdapter = (schoolbookWordReport: IEntcoreSchoolbookWordReport) => {
  const ret = {
    word: { ...schoolbookWordReport.word, sending_date: moment(schoolbookWordReport.word?.sending_date) },
    report: schoolbookWordReport.report?.map(concernedChild => ({
      ...concernedChild,
      responses: concernedChild.responses?.map(response => ({
        ...response,
        modified: moment(response.modified),
      })),
    })),
  };
  return ret as ISchoolbookWordReport;
};

export const schoolbookUriCaptureFunction: IResourceUriCaptureFunction<{ wordId: string }> = url => {
  const wordIdRegex = /^\/schoolbook.+\/word\/(\d+)/;
  const reportIdRegex = /^\/schoolbook.+\/report\/(\d+)/;
  const wordIdMatch = url.match(wordIdRegex);
  return {
    wordId: (wordIdMatch && wordIdMatch[1]) || url.match(reportIdRegex)?.[1],
  };
};

export const schoolbookService = {
  list: {
    //🟠restructure?
    teacher: async (session: IUserSession, filter: string, page: number) => {
      //🟠params variable? rename?
      const api = `/schoolbook/list`;
      const body = JSON.stringify({ filter, page });
      //🟠signedFetchJson?
      return signedFetchJson(`${DEPRECATED_getCurrentPlatform()!.url}${api}`, {
        method: 'POST',
        body,
      }) as Promise<IEntcoreTeacherWordList>; //🟠rename?
    },
  },
  word: {
    get: async (session: IUserSession, schoolbookWordId: string) => {
      const api = `/schoolbook/report/${schoolbookWordId}`;
      const entcoreSchoolbookWordReport = (await fetchJSONWithCache(api)) as IEntcoreSchoolbookWordReport;
      // Run the adapter for the received schoolbook word report
      return schoolbookWordReportAdapter(entcoreSchoolbookWordReport) as ISchoolbookWordReport;
    },
    acknowledge: async (session: IUserSession, schoolbookWordId: string, unacknowledgedChildId: string) => {
      const api = `/schoolbook/relation/acknowledge/${schoolbookWordId}/${unacknowledgedChildId}`;
      return fetchJSONWithCache(api, { method: 'POST' }) as Promise<{ id: number }>;
    },
  },
};
