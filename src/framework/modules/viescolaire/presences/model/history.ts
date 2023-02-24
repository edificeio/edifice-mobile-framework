import { IForgottenNotebook, IHistoryEvent, IIncident, IPunishment } from './events';

export interface IHistory {
  latenesses: IHistoryEvent[];
  departures: IHistoryEvent[];
  regularized: IHistoryEvent[];
  unregularized: IHistoryEvent[];
  noReason: IHistoryEvent[];
  forgottenNotebooks: IForgottenNotebook[];
  incidents: IIncident[];
  punishments: IPunishment[];
}
