/**
 * Formats of the API of `audience`. They don't leave `service/`: the service takes and gives types of the model (see `adapter.ts`).
 * Most formats are the same as the model: aliases.
 */
import type * as Model from '~/modules/audience/model';

export namespace API {
  /** Response of `GET /audience/reactions/{module}/{resourceType}/{resourceId}`. */
  export type ReactionsResponse = Model.AudienceReactions;

  /** Response of `GET /audience/reactions/{module}/{resourceType}?resourceIds=…`. */
  export type ReactionsSummaryResponse = Model.AudienceSummaryReactions;

  /** Body of `POST` and `PUT /audience/reactions/{module}/{resourceType}`. */
  export interface ReactionBody {
    reactionType: string;
    resourceId: string;
  }

  /** Response of `GET /audience/conf/public`: the valid reaction types of the platform. */
  export interface ConfResponse {
    ['reaction-types']: string[];
  }

  /** Response of `GET /audience/views/details/{module}/{resourceType}/{resourceId}`. */
  export type ViewsResponse = Model.AudienceViews;

  /** Response of `GET /audience/views/count/{module}/{resourceType}?resourceIds=…`. */
  export type ViewsSummaryResponse = Model.AudienceSummaryViews;
}
