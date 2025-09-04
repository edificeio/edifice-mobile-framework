export interface LogData {
  time?: string;
  severity?: string;
  message?: string;
}

export interface MenuData {
  title: string;
  action: () => void;
}
