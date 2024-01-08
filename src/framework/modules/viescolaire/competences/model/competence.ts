import type { Moment } from 'moment';

export interface ICompetence {
  date: Moment;
  devoirId: number;
  domaineId: number;
  evaluation: number;
  id: number;
  ownerName: string;
  subjectId: string;
  name?: string;
}
