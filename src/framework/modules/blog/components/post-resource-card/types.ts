import { Moment } from 'moment';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { AudienceReactionType } from '~/framework/modules/core/audience/types';

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
      types: AudienceReactionType[];
      userReaction?: AudienceReactionType;
    };
  };
  session: AuthActiveAccount;
}
