import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';

import { I{{moduleName | capitalize}}NavigationParams } from '../navigation';

// TYPES ==========================================================================================

export interface I{{moduleName | capitalize}}HomeScreenProps extends 
  NativeStackScreenProps<I{{moduleName | capitalize}}NavigationParams, 'Home'> {
    // @scaffolder add props here
  };

// COMPONENT ======================================================================================

export default function {{moduleName | capitalize}}HomeScreen (props: I{{moduleName | capitalize}}HomeScreenProps) {

  // HOOKS ========================================================================================

  const [someState, setSomeState] = React.useState<boolean>(false);

  // RENDER =======================================================================================

  return <PageView>
    <BodyBoldText>{{moduleName}} Home</BodyBoldText>
  </PageView>;

}
