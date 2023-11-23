export interface ScrapbookItem {
  id: string;
  title: string;
  thumbnail: string;
  trashed: number;
  owner: {
    userId: string;
    displayName: string;
  };
}
