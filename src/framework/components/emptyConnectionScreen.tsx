import * as React from 'react';
import I18n from 'i18n-js';

import { EmptyScreen } from './emptyScreen';

export const EmptyConnectionScreen = () => {
  return (
    <EmptyScreen
      svgImage="empty-light"
      title={I18n.t('common.error.connection.title')}
      text={I18n.t('common.error.connection.text')}
    />
  );
};
