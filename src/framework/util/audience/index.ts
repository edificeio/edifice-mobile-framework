import { blogUriCaptureFunction } from '~/framework/modules/blog/service';

import service from './service';
import type { AudienceParameter, AudienceReferer } from './types';

export const computeAudienceRefererFromResourceUri = (uri: string): AudienceReferer | undefined => {
  // This time, only for blog
  const ret = blogUriCaptureFunction(uri);
  if (ret && ret.postId) {
    return {
      module: 'blog',
      resourceType: 'post',
      resourceId: ret.postId,
    };
  }
};

export function markViewAudience(referer: AudienceParameter) {
  const realReferer = referer
    ? typeof referer === 'string'
      ? computeAudienceRefererFromResourceUri(referer)
      : referer
    : undefined;
  if (realReferer) return service.post(realReferer.module, realReferer.resourceType, realReferer.resourceId);
}
