import * as React from 'react';

import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { I18n } from '~/app/i18n';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { cantineRouteNames } from '~/framework/modules/widgets/cantine/navigation';
import { WidgetCard } from '~/framework/modules/widgets/components/card';

export interface CantineWidgetProps {
  session: AuthActiveAccount;
}

export function CantineWidget(_props: Readonly<CantineWidgetProps>) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const onOpen = React.useCallback(() => navigation.navigate(cantineRouteNames.home), [navigation]);

  return <WidgetCard title={I18n.get('widget-cantine-widget-title')} onExpand={onOpen} expandTestID="cantine-widget-open" />;
}
