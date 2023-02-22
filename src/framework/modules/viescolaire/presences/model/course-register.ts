export interface ICourseRegister {
  id: string;
  course_id: string;
  structure_id: string;
  state_id: number;
  start_date: moment.Moment;
  end_date: moment.Moment;
  councellor_input: boolean;
}
