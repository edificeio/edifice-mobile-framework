import moment, { Moment } from 'moment';

import { IUser } from '~/framework/modules/auth/model';
import { IDiarySession, IHomework, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';

export type Homework = {
  id: string;
  subject: string;
  description: string;
  due_date: Moment;
  type: string;
  created_date: Moment;
  audience?: string;
};

export type Session = {
  id: string;
  subject: string;
  date: Moment;
  teacher: string;
  description: string;
  title: string;
};

export const getTeacherName = (teacherId, teachersList: IUser[]) => {
  const result = teachersList.find(personnel => personnel.id === teacherId);
  return result?.displayName ?? '';
};

export const isHomeworkDone = homework => homework.progress !== null && homework.progress.state_label === 'done';

// -- HOMEWORKS DETAILS ------------------

export const homeworkDetailsAdapter = (homework: IHomework) => {
  return {
    id: homework.id,
    subject: homework.subject_id !== 'exceptional' ? homework.subject.name : homework.exceptional_label,
    description: homework.description,
    due_date: homework.due_date,
    type: homework.type.label,
    created_date: homework.created_date,
  } as Homework;
};

export const homeworkListDetailsAdapter = (homework: IHomework, homeworkList?: IHomeworkMap) => {
  const homeworkDataList = homeworkList as IHomeworkMap;
  const homeworksArray = Object.values(homeworkDataList) as IHomework[];
  const reformatedHomeworkArray = [] as Homework[];
  homeworksArray.forEach(item => reformatedHomeworkArray.push(homeworkDetailsAdapter(item)));
  reformatedHomeworkArray.sort(
    (a, b) => moment(a.due_date).diff(moment(b.due_date)) || moment(a.created_date).diff(moment(b.created_date)),
  );

  return {
    homework: homeworkDetailsAdapter(homework),
    homeworkList: reformatedHomeworkArray,
  };
};

// -- HOMEWORKS DETAILS LIST FOR TEACHERS ------------------

const homeworkDetailsTeacherAdapter = (homework: IHomework) => {
  return {
    id: homework.id,
    subject: homework.subject_id !== 'exceptional' ? homework.subject.name : homework.exceptional_label,
    description: homework.description,
    due_date: homework.due_date,
    type: homework.type.label,
    created_date: homework.created_date,
    audience: homework.audience.name,
  } as Homework;
};

export const homeworkListDetailsTeacherAdapter = (homeworkList: IHomeworkMap | IHomework[], subject: string = '') => {
  let homeworksArray = [] as IHomework[];
  if (typeof homeworkList === 'object') {
    const homeworkDataList = homeworkList as IHomeworkMap;
    homeworksArray = Object.values(homeworkDataList) as IHomework[];
  } else {
    homeworksArray = homeworkList;
  }
  const reformatedHomeworkArray = [] as Homework[];
  homeworksArray.forEach(item => reformatedHomeworkArray.push(homeworkDetailsTeacherAdapter(item)));

  return {
    homeworkList: reformatedHomeworkArray,
    subject,
  };
};

// -- SESSIONS DETAILS ------------------

export const sessionDetailsAdapter = (session: IDiarySession, teachers?: IUser[]) => {
  return {
    id: session?.id ? session.id : 0,
    subject: session?.subject_id !== 'exceptional' ? session?.subject?.name : session?.exceptional_label,
    date: session?.date ? session.date : null,
    teacher: teachers ? getTeacherName(session.teacher_id, teachers) : null,
    description: session?.description ? session.description : null,
    title: session?.title ? session.title : null,
  } as Session;
};

export const hasEmptyDescription = (session: IDiarySession) => {
  // retrieve html description tag and search "body" tag
  const regexp = /<(\w+)>[^<]+<\/\1>|[^<>]+/g;
  const htmlTags = session.description.match(regexp) as string[];
  if (!htmlTags) return true;
  const index = htmlTags.findIndex(item => item === 'body') as number;

  if (session.description === '' || index === -1 || htmlTags[index + 1] === '/body') return true;
  return false;
};

export const sessionListDetailsAdapter = (session: IDiarySession, teachers: IUser[], sessionList?: IDiarySession[]) => {
  const reformatedSessionArray = [] as Session[];
  sessionList?.forEach(item => !hasEmptyDescription(item) && reformatedSessionArray.push(sessionDetailsAdapter(item, teachers)));

  return {
    session: sessionDetailsAdapter(session, teachers),
    sessionList: reformatedSessionArray,
  };
};

// -- SESSIONS DETAILS FOR TEACHERS ------------------

export const sessionListDetailsTeacherAdapter = (session: IDiarySession) => {
  const reformatedSessionArray = [sessionDetailsAdapter(session)] as Session[];

  return {
    session: sessionDetailsAdapter(session),
    sessionList: reformatedSessionArray,
  };
};
