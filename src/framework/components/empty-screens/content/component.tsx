import * as React from 'react';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';

const EmptyContentScreen = () => {
  return (
    <EmptyScreen
      svgImage="empty-content"
      title={I18n.get('emptycontent-error-content-title')}
      text={I18n.get('emptycontent-error-content-text')}
    />
  );
};

export default EmptyContentScreen;
