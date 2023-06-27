import type { Moment } from 'moment';

export interface ICompetence {
  date: Moment;
  devoirId: number;
  domaineId: number;
  evaluation: number;
  id: number;
  name: string;
  ownerName: string;
  subjectId: string;
}
