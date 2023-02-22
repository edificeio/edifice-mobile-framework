export interface ICallEvent {
  id?: number;
  start_date?: string;
  end_date?: string;
  comment?: string;
  counsellor_input?: string;
  student_id: string;
  register_id: number;
  type_id: number;
  reason_id?: number;
}

export interface IHistoryEvent {
  start_date: moment.Moment;
  end_date: moment.Moment;
  type_id: number;
  recovery_method: string;
  period: string;
}

export interface IForgottenNotebook {
  date: moment.Moment;
}

export interface IIncident {
  date: moment.Moment;
  protagonist: { label: string };
  label: string;
}

export interface IPunishment {
  created_at: moment.Moment;
  start_date: moment.Moment;
  end_date: moment.Moment;
  delay_at: moment.Moment;
  label: string;
  punishment_category_id: number;
}
