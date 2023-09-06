import { IForgottenNotebook, IHistoryEvent, IIncident, IPunishment } from './events';

export interface IHistory {
  DEPARTURE: {
    events: IHistoryEvent[];
    total: number;
  };
  FORGOTTEN_NOTEBOOK: {
    events: IForgottenNotebook[];
    total: number;
  };
  INCIDENT: {
    events: IIncident[];
    total: number;
  };
  LATENESS: {
    events: IHistoryEvent[];
    total: number;
  };
  NO_REASON: {
    events: IHistoryEvent[];
    total: number;
  };
  PUNISHMENT: {
    events: IPunishment[];
    total: number;
  };
  REGULARIZED: {
    events: IHistoryEvent[];
    total: number;
  };
  UNREGULARIZED: {
    events: IHistoryEvent[];
    total: number;
  };
  recoveryMethod: 'DAY' | 'HALF_DAY' | 'HOUR' | null;
}
