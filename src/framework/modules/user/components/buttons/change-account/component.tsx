import * as React from 'react';

import { I18n } from '~/app/i18n';
import { ChangeAccountButtonProps } from '~/framework/modules/user/components/buttons/change-account/types';
import LargeButton from '~/framework/modules/user/components/buttons/large';

const ChangeAccountButton = ({ style }: ChangeAccountButtonProps) => {
  return (
    <LargeButton
      style={style}
      icon="ui-refresh"
      text={I18n.get('user-page-account-change')}
      action={() => console.log('change account action')}
    />
  );
};

export default ChangeAccountButton;
