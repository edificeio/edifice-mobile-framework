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
  audience?: string;
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

// -- HOMEWORKS DETAILS ------------------

export const homeworkDetailsAdapter = (homework: IHomework) => {
  return {
    id: homework.id,
    subject: homework.subject_id !== 'exceptional' ? homework.subject.name : homework.exceptional_label,
    description: homework.description,
    due_date: homework.due_date,
    type: homework.type.label,
    created_date: homework.created_date,
  } as homework;
};

export const homeworkListDetailsAdapter = (homework: IHomework, homeworkList?: IHomeworkList) => {
  const homeworkDataList = homeworkList as IHomeworkList;
  const homeworksArray = Object.values(homeworkDataList) as IHomework[];
  const reformatedHomeworkArray = [] as homework[];
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
  } as homework;
};

export const homeworkListDetailsTeacherAdapter = (homeworkList: IHomeworkList | IHomework[], subject: string = '') => {
  let homeworksArray = [] as IHomework[];
  if (typeof homeworkList === 'object') {
    const homeworkDataList = homeworkList as IHomeworkList;
    homeworksArray = Object.values(homeworkDataList) as IHomework[];
  } else {
    homeworksArray = homeworkList;
  }
  const reformatedHomeworkArray = [] as homework[];
  homeworksArray.forEach(item => reformatedHomeworkArray.push(homeworkDetailsTeacherAdapter(item)));

  return {
    homeworkList: reformatedHomeworkArray,
    subject,
  };
};

// -- SESSIONS DETAILS ------------------

export const sessionDetailsAdapter = (session: ISession, teachersList?: IPersonnelList) => {
  return {
    id: session?.id ? session.id : 0,
    subject: session?.subject_id !== 'exceptional' ? session?.subject?.name : session?.exceptional_label,
    date: session?.date ? session.date : null,
    teacher: teachersList ? getTeacherName(session.teacher_id, teachersList) : null,
    description: session?.description ? session.description : null,
    title: session?.title ? session.title : null,
  } as session;
};

export const sessionListDetailsAdapter = (session: ISession, teachersList: IPersonnelList, sessionList?: ISession[]) => {
  const reformatedSessionArray = [] as session[];
  sessionList?.forEach(item => reformatedSessionArray.push(sessionDetailsAdapter(item, teachersList)));

  return {
    session: sessionDetailsAdapter(session, teachersList),
    sessionList: reformatedSessionArray,
  };
};

// -- SESSIONS DETAILS FOR TEACHERS ------------------

export const sessionListDetailsTeacherAdapter = (session: ISession) => {
  const reformatedSessionArray = [sessionDetailsAdapter(session)] as session[];

  return {
    session: sessionDetailsAdapter(session),
    sessionList: reformatedSessionArray,
  };
};