/**
 * Domain of `audience`: the reactions and the views of the resources of other modules.
 * The formats of the API are the same as these types (see `service/types.ts`): the service gives them as they come.
 */
import type { AccountType } from '~/modules/auth/model';

/** The resource that has the reactions and the views: given by the module that shows it. */
export interface AudienceReferer {
  module: string;
  resourceType: string;
  resourceId: string;
}

/** A referer, or the URI of the resource (see `computeAudienceRefererFromResourceUri`). */
export type AudienceParameter = AudienceReferer | string | undefined;

export interface AudienceUserReaction {
  userId: string;
  profile: AccountType;
  reactionType: string;
  displayName: string;
}

/** A page of the reactions to a resource, with their counters. */
export interface AudienceReactions {
  reactionCounters: {
    allReactionsCounter: number;
    countByType: Record<string, number>;
  };
  userReactions: AudienceUserReaction[];
}

/** Reactions to a resource, in short: its counter, the types given, and the one of the user. */
export interface AudienceResourceReactions {
  reactionTypes: string[];
  userReaction: string;
  totalReactionsCounter: number;
}

/** Reactions to several resources of the same type, by resource id. */
export interface AudienceSummaryReactions {
  reactionsByResource: Record<string, AudienceResourceReactions>;
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

/** Views of several resources of the same type: counter by resource id. */
export type AudienceSummaryViews = Record<string, number>;

/** A point of the screen, in the coordinates of the window. */
export interface AudiencePoint {
  x: number;
  y: number;
}

/** A rectangle of the screen, in the coordinates of the window. */
export interface AudienceRect extends AudiencePoint {
  height: number;
  width: number;
}
