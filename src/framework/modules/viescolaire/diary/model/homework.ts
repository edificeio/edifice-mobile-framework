import { IAudience } from './audience';
import { ISubject } from './subject';

export interface IHomework {
  due_date: moment.Moment;
  id: string;
  is_published: boolean;
  progress: {
    created: string;
    homework_id: number;
    modified: string;
    state_id: number;
    state_label: string;
    user_id: string;
  } | null;
  exceptional_label: string | null;
  subject_id: string;
  subject: ISubject;
  type: {
    id: number;
    label: string;
    rank: number;
    structure_id: string;
  };
  description: string;
  created_date: moment.Moment;
  audience: IAudience;
  session_id: string;
}

export type IHomeworkMap = {
  [key: string]: IHomework;
};
