/* TYPE DEFINITION */

export type IHomework = {
  due_date: moment.Moment;
  id: string;
  progress?: {
    created: string;
    homework_id: number;
    modified: string;
    state_id: number;
    state_label: string;
    user_id: string;
  };
  exceptional_label: string;
  subject_id: string;
  subject: {
    id: string;
    externalId: string;
    name: string;
    rank?: number;
  };
  type: {
    id: number;
    label: string;
    rank: number;
    structure_id: string;
  };
  description: string;
  created_date: moment.Moment;
  audience: {
    externalId: string;
    id: string;
    labels: string[];
    name: string;
  };
  session_id: string;
};
