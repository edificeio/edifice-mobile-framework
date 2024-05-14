import { Moment } from 'moment';

export interface BlogPostResourceCardProps {
  action: () => void;
  authorId: string;
  authorName: string;
  comments: number;
  contentHtml: string;
  date: Moment;
  title: string;
  state: 'PUBLISHED' | 'SUBMITTED';
  resourceId: string;
}
