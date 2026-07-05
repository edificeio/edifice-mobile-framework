import React from 'react';

import { useFocusEffect } from '@react-navigation/native';

import { blogUriCaptureFunction } from '~/framework/modules/blog/service/adapters';
import { Module } from '~/framework/util/moduleTool';

import config from './module-config';
import { audienceService } from './service';
import { AudienceParameter, AudienceReferer } from './types';

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

/**
 * The main hook to use audience features.
 * Currently this handles only marking views as seen.
 * @param referer
 * @returns
 */
export function useAudience(referer: AudienceReferer) {
  const viewMarked = React.useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      viewMarked.current = false;
    }, []),
  );

  return {
    markView: async () => {
      if (viewMarked.current === false) await audienceService.view.post(referer.module, referer.resourceType, referer.resourceId);
      viewMarked.current = true;
    },
  };
}
