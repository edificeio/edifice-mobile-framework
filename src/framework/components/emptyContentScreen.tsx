import * as React from 'react';

import { I18n } from '~/app/i18n';

import { EmptyScreen } from './emptyScreen';

export const EmptyContentScreen = () => {
  return (
    <EmptyScreen
      svgImage="empty-content"
      title={I18n.get('common.error.content.title')}
      text={I18n.get('common.error.content.text')}
    />
  );
};
