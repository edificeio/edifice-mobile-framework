import { AccountType } from '~/framework/modules/auth/model';

export enum AudienceReactionType {
  REACTION_1 = 'REACTION_1',
  REACTION_2 = 'REACTION_2',
  REACTION_3 = 'REACTION_3',
  REACTION_4 = 'REACTION_4',
}

export interface AudienceUserReaction {
  userId: string;
  profile: AccountType;
  reactionType: AudienceReactionType;
  displayName: string;
}

export interface AudienceReactions {
  allReactionsCounter: number;
  countByType: Record<AudienceReactionType, number>;
  userReactions: AudienceUserReaction[];
}

export interface AudienceViewer {
  counter: number;
  profile: AccountType;
}

export interface AudienceViews {
  uniqueViewsCounter: number;
  uniqueViewsPerProfile: AudienceViewer[];
  viewsCounter: number;
}

export interface AudienceReferer {
  module: string;
  resourceType: string;
  resourceId: string;
}

export type AudienceParameter = AudienceReferer | string | undefined;
