import * as React from 'react';

import { I18n } from '~/app/i18n';

import { EmptyScreen } from './emptyScreen';

export const EmptyConnectionScreen = () => {
  return (
    <EmptyScreen
      svgImage="empty-light"
      title={I18n.get('common.error.connection.title')}
      text={I18n.get('common.error.connection.text')}
    />
  );
};
