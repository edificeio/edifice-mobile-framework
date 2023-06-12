import { IAudience } from './audience';
import { IHomework } from './homework';
import { ISubject } from './subject';

export interface IDiarySession {
  id: string;
  is_published: boolean;
  is_empty: boolean;
  date: moment.Moment;
  subject_id: string;
  subject: ISubject;
  exceptional_label: string | null;
  start_time: string;
  end_time: string;
  teacher_id: string;
  description: string;
  title: string;
  homeworks: IHomework[];
  course_id: string;
  audience: IAudience;
}
