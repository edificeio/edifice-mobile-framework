/**
 * Schoolbook services
 */

import moment from "moment";
import { IResourceUriCaptureFunction } from "../../../framework/util/notifications";
import { IUserSession } from "../../../framework/util/session";
import { fetchJSONWithCache } from "../../../infra/fetchWithCache";
import { ISchoolbookWordReport } from "../reducer";

export interface IEntcoreSchoolbookWordResponse  {
  id: number;
  owner: string;
  parentName: string;
  comment: string;
  modified: string;
}

export interface IEntcoreSchoolbookWordAcknowledgment  {
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
  shared: Array<{userId?: string, groupId?: string} & any> | [];
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

export const schoolbookWordReportAdapter = (schoolbookWordReport: IEntcoreSchoolbookWordReport) => {
  const ret = {
    word: {...schoolbookWordReport.word, sending_date: moment(schoolbookWordReport.word?.sending_date)},
    report: schoolbookWordReport.report?.map(concernedChild => ({
      ...concernedChild, responses: concernedChild.responses?.map(response => ({
        ...response, modified: moment(response.modified)
      }))
    }))
  };
  return ret as ISchoolbookWordReport;
}

export const schoolbookUriCaptureFunction: IResourceUriCaptureFunction<{ wordId: string }> = url => {
  const wordIdRegex = /^\/schoolbook.+\/word\/(\d+)/;
  return {
    wordId: url.match(wordIdRegex)?.[1]
  }
}

export const schoolbookService = {
  word: {
    get: async (session: IUserSession, schoolbookWordId: string) => {
      const api = `/schoolbook/report/${schoolbookWordId}`;
      const entcoreSchoolbookWordReport = await fetchJSONWithCache(api) as IEntcoreSchoolbookWordReport;
      // Run the adapter for the received schoolbook word report
      return schoolbookWordReportAdapter(entcoreSchoolbookWordReport) as ISchoolbookWordReport;
    },
    acknowledge: async (session: IUserSession, schoolbookWordId: string, unacknowledgedChildId: string) => {
      const api = `/schoolbook/relation/acknowledge/${schoolbookWordId}/${unacknowledgedChildId}`;
      return fetchJSONWithCache(api, { method: "POST" }) as Promise<{id: number}>;
    }
  },
}
