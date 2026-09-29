import * as React from 'react';

import { ChangeAccountButtonProps } from '~/framework/modules/user/components/buttons/change-account/types';
import LargeButton from '~/framework/modules/user/components/buttons/large';
import { I18n } from '~/util/i18n';

const ChangeAccountButton = ({ action, style }: ChangeAccountButtonProps) => {
  return <LargeButton style={style} icon="ui-refresh" text={I18n.get('auth-accountbutton-change')} action={action} />;
};

export default ChangeAccountButton;
