import moment from 'moment';

import { IHomework, IHomeworkList } from '~/modules/viescolaire/cdt/state/homeworks';
import { ISession } from '~/modules/viescolaire/cdt/state/sessions';
import { IPersonnelList } from '~/modules/viescolaire/viesco/state/personnel';

export type homework = {
  id: string;
  subject: string;
  description: string;
  due_date: moment.Moment;
  type: string;
  created_date: moment.Moment;
};

export type session = {
  id: string;
  subject: string;
  date: moment.Moment;
  teacher: string;
  description: string;
  title: string;
};

export const getTeacherName = (teacherId, teachersList: IPersonnelList) => {
  const result = teachersList.find(personnel => personnel.id === teacherId);
  if (typeof result === 'undefined') return '';
  return `${result.lastName} ${result.firstName}`;
};

export const isHomeworkDone = homework => homework.progress !== null && homework.progress.state_label === 'done';

export const homeworkDetailsAdapter = (homework: IHomework) => {
  return {
    id: homework.id,
    subject: homework.subject_id !== 'exceptional' ? homework.subject.name : homework.exceptional_label,
    description: homework.description,
    due_date: homework.due_date,
    type: homework.type,
    created_date: homework.created_date,
  } as homework;
};

export const homeworkListDetailsAdapter = (homework: IHomework, homeworkList?: IHomeworkList) => {
  const homeworkDataList = homeworkList as IHomeworkList;
  const homeworksArray = Object.values(homeworkDataList) as IHomework[];
  const reformatedHomeworkArray = [] as homework[];
  homeworksArray.map(item => reformatedHomeworkArray.push(homeworkDetailsAdapter(item)));

  return {
    homework: homeworkDetailsAdapter(homework),
    homeworkList: reformatedHomeworkArray,
  };
};

export const sessionDetailsAdapter = (session: ISession, teachersList: IPersonnelList) => {
  return {
    id: session.id,
    subject: session.subject_id !== 'exceptional' ? session.subject.name : session.exceptional_label,
    date: session.date,
    teacher: getTeacherName(session.teacher_id, teachersList),
    description: session.description,
    title: session.title,
  } as session;
};

export const sessionListDetailsAdapter = (session: ISession, teachersList: IPersonnelList, sessionList?: ISession[]) => {
  const reformatedSessionArray = [] as session[];
  sessionList.map(item => reformatedSessionArray.push(sessionDetailsAdapter(item, teachersList)));

  return {
    session: sessionDetailsAdapter(session, teachersList),
    sessionList: reformatedSessionArray,
  };
};
