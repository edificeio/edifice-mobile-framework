import * as React from 'react';

import { I18n } from '~/app/i18n';
import { EmptyScreen } from '~/framework/components/empty-screens';

const EmptyErrorScreen = ({ onBack }: { onBack?: () => void }) => {
  return (
    <EmptyScreen
      svgImage="empty-light"
      title={I18n.get('empty-error-title')}
      text={I18n.get('empty-error-text')}
      buttonAction={onBack}
      buttonText={I18n.get('empty-error-button')}
    />
  );
};

export default EmptyErrorScreen;
