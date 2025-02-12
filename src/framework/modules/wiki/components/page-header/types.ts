export enum HeaderStatus {
  VISIBLE = 'visible',
  HIDDEN = 'hidden',
}

export interface PageHeaderProps {
  status?: HeaderStatus;
  children?: React.ReactNode;
}
