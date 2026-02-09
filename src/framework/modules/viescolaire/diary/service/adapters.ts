import moment from 'moment';

import { IDiaryCourse, IDiarySession, IHomework, IHomeworkMap } from '~/framework/modules/viescolaire/diary/model';
import {
  IBackendCourse,
  IBackendHomework,
  IBackendHomeworkList,
  IBackendSession,
} from '~/framework/modules/viescolaire/diary/service/types';

export const homeworkAdapter = (data: IBackendHomework): IHomework => {
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

export const courseAdapter = (data: IBackendCourse): IDiaryCourse => {
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

export const homeworksAdapter = (data: IBackendHomeworkList): IHomeworkMap => {
  const homeworks = {} as IHomeworkMap;

  for (const homework of data) {
    homeworks[homework.id] = homeworkAdapter(homework);
  }
  return homeworks;
};

export const sessionAdapter = (data: IBackendSession): IDiarySession => {
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
