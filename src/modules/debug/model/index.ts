/** An entry of the app log, as shown by the log screen. `time` and `severity` are missing when the line doesn't follow the log format. */
export interface LogData {
  time?: string;
  severity?: string;
  message?: string;
}
