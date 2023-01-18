import * as React from 'react';

import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';

import type { {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps } from './types';

export default function {{moduleName | toCamelCase | capitalize}}HomeScreen(props: {{moduleName | toCamelCase | capitalize}}HomeScreenPrivateProps) {
  // HOOKS ========================================================================================

  const [someState, setSomeState] = React.useState<boolean>(false);

  // RENDER =======================================================================================

  return (
    <PageView>
      <BodyBoldText>{{moduleName | toCamelCase}} Home</BodyBoldText>
    </PageView>
  );
}
