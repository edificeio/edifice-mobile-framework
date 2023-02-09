interface IEvents {
  id: number;
  comment: string;
  counsellor_input: boolean;
  register_id: string;
  type_id: number;
}

export interface IDayHistory {
  name: string;
  type_id: number;
  events: IEvents[];
}

export interface IStudent {
  id: string;
  name: string;
  group: string;
  group_name: string;
  last_course_absent: boolean;
  exempted: boolean;
  exemption_attendance: boolean;
  forgotten_notebook: boolean;
  day_history: IDayHistory[];
}

interface ITeacher {
  id: string;
  displayName: string;
  functions: string;
}

export interface IClassCall {
  personnel_id: string;
  roof_id: string;
  state_id: number;
  course_id: string;
  subject_id: string;
  start_date: moment.Moment;
  end_date: moment.Moment;
  counsellor_input: boolean;
  teachers: ITeacher[];
  students: IStudent[];
}
