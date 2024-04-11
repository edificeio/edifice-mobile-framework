export interface AudienceReferer {
  module: string;
  resourceType: string;
  resourceId: string;
}

export type AudienceParameter = AudienceReferer | string | undefined;
