import I18n from 'i18n-js';
import * as React from 'react';

import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { NavBarAction } from '~/framework/navigation/navBar';

import { {{moduleName | capitalize}}OtherScreenAllProps } from './type';

// NAVBAR =========================================================================================

export function computeNavBar(disabled: boolean, onPress?: () => void) {
  return {
    headerLeft: () => <NavBarAction title={I18n.t('common.apply')} disabled={disabled} onPress={onPress} />,
  };
}

// COMPONENT ======================================================================================

export default function {{moduleName | capitalize}}OtherScreen(props: {{moduleName | capitalize}}OtherScreenAllProps) {
  // HOOKS ========================================================================================

  const [someState, setSomeState] = React.useState<boolean>(false);

  // RENDER =======================================================================================

  return (
    <PageView>
      <BodyBoldText>{{moduleName}} Other</BodyBoldText>
    </PageView>
  );
}
