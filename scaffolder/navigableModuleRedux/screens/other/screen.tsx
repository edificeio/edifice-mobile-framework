import I18n from 'i18n-js';
import * as React from 'react';

import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { NavBarAction } from '~/framework/navigation/navBar';

import type { {{moduleName | toCamelCase | capitalize}}OtherScreenPrivateProps } from './types';

// NAVBAR =========================================================================================

export function computeNavBar(disabled: boolean, onPress?: () => void) {
  return {
    headerLeft: () => <NavBarAction title={I18n.t('common.apply')} disabled={disabled} onPress={onPress} />,
  };
}

// COMPONENT ======================================================================================

export default function {{moduleName | toCamelCase | capitalize}}OtherScreen(props: {{moduleName | toCamelCase | capitalize}}OtherScreenPrivateProps) {
  // HOOKS ========================================================================================

  const [someState, setSomeState] = React.useState<boolean>(false);

  // RENDER =======================================================================================

  return (
    <PageView>
      <BodyBoldText>{{moduleName | toCamelCase}} Other</BodyBoldText>
    </PageView>
  );
}
