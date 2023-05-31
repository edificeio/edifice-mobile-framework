export interface IStudentsEvents {
  studentsEvents: any;
  limit?: number;
  offset?: number;
  recoveryMethods: string; // {HALF_DAY / HOUR / DAY}
  totals: {
    JUSTIFIED: number;
    UNJUSTIFIED: number;
    LATENESS: number;
    DEPARTURE: number;
  };
}
