export interface IFolder {
  id: string;
  name: string;
  path: string;
  unread: number;
  count: number;
  folders: IFolder[];
}
