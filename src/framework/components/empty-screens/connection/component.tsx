import * as React from 'react';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';

const EmptyConnectionScreen = () => {
  return (
    <EmptyScreen
      svgImage="empty-light"
      title={I18n.get('emptyconnection-error-connection-title')}
      text={I18n.get('emptyconnection-error-connection-text')}
    />
  );
};

export default EmptyConnectionScreen;
