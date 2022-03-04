import * as React from 'react';
import I18n from 'i18n-js';

import { EmptyScreen } from './emptyScreen';

export const EmptyContentScreen = () => {
  return (
    <EmptyScreen svgImage="empty-content" title={I18n.t('common.error.content.title')} text={I18n.t('common.error.content.text')} />
  );
};
