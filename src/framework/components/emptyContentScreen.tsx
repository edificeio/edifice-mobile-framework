import * as React from 'react';
import I18n from 'i18n-js';

import { EmptyScreen } from './emptyScreen';
import EmptyContent from 'ode-images/empty-screen/empty-content.svg';

export const EmptyContentScreen = () => {
  return (
    <EmptyScreen
      svgImage={<EmptyContent />}
      title={I18n.t('common.error.content.title')}
      text={I18n.t('common.error.content.text')}
    />
  );
};
