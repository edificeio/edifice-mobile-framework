import { IAudience } from './audience';
import { ISubject } from './subject';

export type ISessionHomework = {
  archive_school_year: string;
  audience: IAudience;
  audience_id: string;
  color: string;
  created: string;
  description: string;
  due_date: string;
  estimatedtime: number;
  exceptional_label: string;
  from_session_id: string;
  id: string;
  is_published: boolean;
  modified: string;
  owner_id: string;
  publish_date: string;
  session_id: string;
  structure_id: string;
  subject: ISubject;
  subject_id: string;
  teacher_id: string;
  type: {
    id: number;
    label: string;
    rank: number;
    structure_id: string;
  };
  type_id: number;
  workload: number;
};
