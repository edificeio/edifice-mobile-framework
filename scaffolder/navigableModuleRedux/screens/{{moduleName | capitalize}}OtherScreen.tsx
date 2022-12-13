import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavBarAction } from '~/framework/navigation/navBar';
import I18n from 'i18n-js';

import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';

import { I{{moduleName | capitalize}}NavigationParams } from '../navigation';

// TYPES ==========================================================================================

export interface I{{moduleName | capitalize}}OtherScreenProps extends 
  NativeStackScreenProps<I{{moduleName | capitalize}}NavigationParams, 'Other'> {
    // @scaffolder add props here
  };

// NAVBAR =========================================================================================

export function computeNavBar(disabled: boolean, onPress?: () => void) {
  return <NavBarAction title={I18n.t('common.apply')} disabled={disabled} onPress={onPress} />;
}

// COMPONENT ======================================================================================

export default function {{moduleName | capitalize}}OtherScreen (props: I{{moduleName | capitalize}}OtherScreenProps) {

  // HOOKS ========================================================================================

  const [someState, setSomeState] = React.useState<boolean>(false);

  // RENDER =======================================================================================

  return <PageView>
    <BodyBoldText>{{moduleName}} Other</BodyBoldText>
  </PageView>;

}