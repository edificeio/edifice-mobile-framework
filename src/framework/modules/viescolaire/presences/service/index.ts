import moment from 'moment';
import querystring from 'querystring';

import { ISession } from '~/framework/modules/auth/model';
import {
  IClassCall,
  ICourse,
  ICourseRegister,
  IMemento,
  IRelative,
  IStudentsEvents,
  IUserChild,
} from '~/framework/modules/viescolaire/presences/model';
import { LocalFile } from '~/framework/util/fileHandler';
import fileTransferService from '~/framework/util/fileHandler/service';
import { fetchJSONWithCache } from '~/infra/fetchWithCache';

type IBackendClassCall = {
  personnel_id: string;
  roof_id: string;
  state_id: number;
  course_id: string;
  subject_id: string;
  start_date: string;
  end_date: string;
  counsellor_input: boolean;
  teachers: {
    id: string;
    displayName: string;
    functions: string;
  }[];
  students: {
    id: string;
    name: string;
    group: string;
    group_name: string;
    last_course_absent: boolean;
    exempted: boolean;
    exemption_attendance: boolean;
    forgotten_notebook: boolean;
    day_history: {
      name: string;
      start_date: string;
      end_date: string;
      type_id: number;
      events: {
        id: number;
        comment: string;
        counsellor_input: boolean;
        end_date: string;
        start_date: string;
        register_id: string;
        type_id: number;
      }[];
    }[];
  }[];
};

type IBackendCourse = {
  id: string;
  allowRegister: boolean;
  subjectId: string;
  classes: string[];
  structureId: string;
  startDate: string;
  endDate: string;
  roomLabels: string[];
  groups: string[];
  registerId: string;
  splitSlot: boolean;
};

type IBackendCourseRegister = {
  id: string;
  course_id: string;
  structure_id: string;
  state_id: number;
  start_date: string;
  end_date: string;
  councellor_input: boolean;
};

type IBackendMemento = {
  id: string;
  name: string;
  birth_date: string;
  classes: string[];
  groups: string[];
  comment: string;
  accommodation: string;
  relatives: IRelative[];
};

type IBackendStudentsEvents = {
  students_events: any;
  limit?: number;
  offset?: number;
  recovery_methods: string; // {HALF_DAY / HOUR / DAY}
  totals: {
    JUSTIFIED: number;
    UNJUSTIFIED: number;
    LATENESS: number;
    DEPARTURE: number;
  };
};

type IBackendUserChild = {
  birth: string;
  displayName: string;
  firstName: string;
  id: string;
  lastName: string;
  structures: {
    classes: {
      id: string;
      name: string;
      structure: string;
    }[];
    id: string;
    name: string;
  }[];
};

type IBackendCourseList = IBackendCourse[];
type IBackendUserChildren = IBackendUserChild[];

const classCallAdapter = (data: IBackendClassCall): IClassCall => {
  return {
    personnel_id: data.personnel_id,
    roof_id: data.roof_id,
    state_id: data.state_id,
    course_id: data.course_id,
    subject_id: data.subject_id,
    start_date: moment(data.start_date),
    end_date: moment(data.end_date),
    counsellor_input: data.counsellor_input,
    teachers: data.teachers,
    students: data.students,
  } as IClassCall;
};

const courseAdapter = (data: IBackendCourse): ICourse => {
  return {
    id: data.id,
    allowRegister: data.allowRegister,
    subjectId: data.subjectId,
    classes: data.classes,
    structureId: data.structureId,
    startDate: moment(data.startDate),
    endDate: moment(data.endDate),
    roomLabels: data.roomLabels,
    groups: data.groups,
    registerId: data.registerId,
    splitSlot: data.splitSlot,
  } as ICourse;
};

const courseRegisterAdapter = (data: IBackendCourseRegister): ICourseRegister => {
  return {
    id: data.id,
    course_id: data.course_id,
    structure_id: data.structure_id,
    state_id: data.state_id,
    start_date: moment(data.start_date),
    end_date: moment(data.end_date),
    councellor_input: data.councellor_input,
  } as ICourseRegister;
};

const mementoAdapter = (data: IBackendMemento): IMemento => {
  return {
    id: data.id,
    name: data.name,
    birth_date: data.birth_date,
    classes: data.classes,
    groups: data.groups,
    comment: data.comment,
    relatives: data.relatives,
    accommodation: data.accommodation,
  } as IMemento;
};

const studentsEventsAdapter = (data: IBackendStudentsEvents): IStudentsEvents => {
  return {
    studentsEvents: data.students_events,
    limit: data.limit,
    offset: data.offset,
    recoveryMethods: data.recovery_methods,
    totals: data.totals,
  } as IStudentsEvents;
};

const userChildAdapter = (data: IBackendUserChild): IUserChild => {
  return {
    birth: data.birth,
    displayName: data.displayName,
    firstName: data.firstName,
    id: data.id,
    lastName: data.lastName,
    structures: data.structures,
  } as IUserChild;
};

export const presencesService = {
  absence: {
    create: async (
      session: ISession,
      structureId: string,
      studentId: string,
      startDate: moment.Moment,
      endDate: moment.Moment,
      description: string,
    ) => {
      const api = '/presences/statements/absences';
      const body = JSON.stringify({
        structure_id: structureId,
        student_id: studentId,
        start_at: startDate.format('YYYY-MM-DD HH:mm:ss'),
        end_at: endDate.format('YYYY-MM-DD HH:mm:ss'),
        description,
      });
      await fetchJSONWithCache(api, {
        method: 'POST',
        body,
      });
    },
    createWithFile: async (
      session: ISession,
      structureId: string,
      studentId: string,
      startDate: moment.Moment,
      endDate: moment.Moment,
      description: string,
      file: LocalFile,
    ) => {
      const api = '/presences/statements/absences/attachment';
      const fields = {
        structure_id: structureId,
        student_id: studentId,
        start_at: startDate.format('YYYY-MM-DD HH:mm:ss'),
        end_at: endDate.format('YYYY-MM-DD HH:mm:ss'),
        description,
      };
      await fileTransferService.uploadFile(
        session,
        file,
        {
          url: api,
          fields,
        },
        res => {
          console.log(res);
          return undefined!; // TODO return file id
        },
      );
    },
  },
  classCall: {
    get: async (session: ISession, id: string) => {
      const api = `/presences/registers/${id}`;
      const classCall = (await fetchJSONWithCache(api)) as IBackendClassCall;
      return classCallAdapter(classCall);
    },
  },
  courses: {
    get: async (
      session: ISession,
      teacherId: string,
      structureId: string,
      startDate: string,
      endDate: string,
      allowMultipleSlots?: boolean,
    ) => {
      const api = `/presences/courses?${querystring.stringify({
        teacher: teacherId,
        structure: structureId,
        start: startDate,
        end: endDate,
        forgotten_registers: false,
        multiple_slot: allowMultipleSlots,
      })}`;
      const courses = (await fetchJSONWithCache(api)) as IBackendCourseList;
      return courses.map(course => courseAdapter(course)) as ICourse[];
    },
  },
  courseRegister: {
    create: async (session: ISession, course: ICourse, teacherId: string, allowMultipleSlots?: boolean) => {
      const api = '/presences/registers';
      const body = JSON.stringify({
        course_id: course.id,
        structure_id: course.structureId,
        start_date: course.startDate.format('YYYY-MM-DD HH:mm:ss'),
        end_date: course.endDate.format('YYYY-MM-DD HH:mm:ss'),
        subject_id: course.subjectId,
        groups: course.groups,
        classes: course.classes ?? course.groups,
        teacherIds: [teacherId],
        split_slot: allowMultipleSlots,
      });
      const courseRegister = (await fetchJSONWithCache(api, {
        method: 'POST',
        body,
      })) as IBackendCourseRegister;
      return courseRegisterAdapter(courseRegister);
    },
  },
  memento: {
    get: async (session: ISession, studentId: string) => {
      const api = `/viescolaire/memento/students/${studentId}`;
      const memento = (await fetchJSONWithCache(api)) as IBackendMemento;
      return mementoAdapter(memento);
    },
  },
  preferences: {
    getRegister: async (session: ISession) => {
      const api = '/userbook/preference/presences.register';
      const data = (await fetchJSONWithCache(api)) as { preference: string };
      return data.preference;
    },
  },
  settings: {
    getAllowMultipleSlots: async (session: ISession, structureId: string) => {
      const api = `/presences/structures/${structureId}/settings/multiple-slots`;
      const data = (await fetchJSONWithCache(api)) as { allow_multiple_slots: boolean };
      return data.allow_multiple_slots;
    },
  },
  studentsEvents: {
    get: async (session: ISession, structureId: string, studentIds: string[], startDate: moment.Moment, endDate: moment.Moment) => {
      const api = `/presences/structures/${structureId}/students/events`;
      const body = JSON.stringify({
        student_ids: studentIds,
        start_at: startDate.format('YYYY-MM-DD'),
        end_at: endDate.format('YYYY-MM-DD'),
        types: ['NO_REASON', 'UNREGULARIZED', 'REGULARIZED', 'LATENESS', 'DEPARTURE'],
      });
      const events = (await fetchJSONWithCache(api, {
        method: 'POST',
        body,
      })) as IBackendStudentsEvents;
      return studentsEventsAdapter(events);
    },
  },
  userChildren: {
    get: async (session: ISession, relativeId: string) => {
      const api = `/presences/children?relativeId=${relativeId}`;
      const userChildren = (await fetchJSONWithCache(api)) as IBackendUserChildren;
      return userChildren.map(child => userChildAdapter(child)) as IUserChild[];
    },
  },
};
