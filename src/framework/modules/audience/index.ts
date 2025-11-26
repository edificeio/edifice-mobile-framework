import config from './module-config';
import { audienceService } from './service';
import { AudienceParameter, AudienceReferer } from './types';

import { blogUriCaptureFunction } from '~/framework/modules/blog/service';
import { Module } from '~/framework/util/moduleTool';

export default new Module({ config, reducer: () => null });

export const computeAudienceRefererFromResourceUri = (uri: string): AudienceReferer | undefined => {
  // This time, only for blog
  const ret = blogUriCaptureFunction(uri);
  if (ret && ret.postId) {
    return {
      module: 'blog',
      resourceId: ret.postId,
      resourceType: 'post',
    };
  }
};

export function markViewAudience(referer: AudienceParameter) {
  const realReferer = referer
    ? typeof referer === 'string'
      ? computeAudienceRefererFromResourceUri(referer)
      : referer
    : undefined;
  if (realReferer) return audienceService.view.post(realReferer.module, realReferer.resourceType, realReferer.resourceId);
}
