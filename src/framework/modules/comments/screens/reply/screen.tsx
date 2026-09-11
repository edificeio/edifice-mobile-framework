import React from 'react';

import { ModuleScreenProps } from '~/app/navigation/types';
import { modalScreenOptions } from '~/app/navigation/util';
import { withSession } from '~/framework/modules/auth/util';

export const CommentsThreadReplyScreenOptions = modalScreenOptions<'comments/reply'>('modal', () => ({}));
export const CommentsThreadReplyScreen = withSession<ModuleScreenProps<'comments/reply'>>(function ({
  navigation,
  route,
  session,
}) {});
