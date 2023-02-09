export interface ICourse {
  id: string;
  allowRegister: boolean;
  subjectId: string;
  classes: string[];
  structureId: string;
  startDate: moment.Moment;
  endDate: moment.Moment;
  roomLabels: string[];
  groups: string[];
  registerId: string;
  splitSlot: boolean;
}
