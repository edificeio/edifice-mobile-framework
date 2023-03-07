import I18n from 'i18n-js';
import * as React from 'react';

import { EmptyScreen } from './emptyScreen';

export const EmptyMediaNotSupportedScreen = () => {
  return (
    <EmptyScreen
      svgImage="empty-search"
      title={I18n.t('common.error.mediaNotSupported.title')}
      text={I18n.t('common.error.mediaNotSupported.text')}
    />
  );
};
