import { Moment } from 'moment';

import { AuthActiveAccount } from '~/framework/modules/auth/model';

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
  audience?: {
    views?: number;
    reactions?: {
      total: number;
      types: string[];
      userReaction?: string;
    };
  };
  session: AuthActiveAccount;
  blogVisibility: string;
}
