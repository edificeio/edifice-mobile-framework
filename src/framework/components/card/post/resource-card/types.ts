import { Moment } from 'moment';

import { AuthActiveAccount } from '~/framework/modules/auth/model';

export interface PostResourceCardProps {
  action: () => void;
  authorId: string;
  authorName: string;
  comments: number;
  date: Moment;
  title: string;
  resourceId: string;
  audience?: {
    views?: number;
    reactions?: {
      total: number;
      types: string[];
      userReaction?: string;
    };
  };
  session: AuthActiveAccount;
}

export interface BlogPostResourceCardProps extends PostResourceCardProps {
  blogVisibility: string;
  contentHtml: string;
  isManager: boolean;
  state: 'PUBLISHED' | 'SUBMITTED';
}

export interface AnnouncementPostResourceCardProps extends PostResourceCardProps {}
