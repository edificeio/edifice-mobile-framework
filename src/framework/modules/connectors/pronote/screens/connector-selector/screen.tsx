import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import { I18n } from '~/app/i18n';
import { PageView } from '~/framework/components/page';
import { PronoteNavigationParams, pronoteRouteNames } from '~/framework/modules/connectors/pronote/navigation';
import DropdownSelectorTemplate from '~/framework/modules/connectors/pronote/components/dropdown-selector';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';
import { IEntcoreApp } from '~/framework/util/moduleTool';

export interface ConnectorSelectorScreenNavParams {
  matchingApps: IEntcoreApp[];
}

const getPronoteRedirectUrl = (connectorAddress: string) => {
  const getSlash = (link: string) => (link.charAt(link.length - 1) === '/' ? '' : '/');
  return `/auth/redirect?url=${encodeURIComponent(`${connectorAddress}${getSlash(connectorAddress)}mobile.html`)}`;
};

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PronoteNavigationParams, typeof pronoteRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('pronote'),
  }),
});

export default function ConnectorSelectorScreen({
  route,
}: NativeStackScreenProps<PronoteNavigationParams, typeof pronoteRouteNames.home>) {
  const { matchingApps } = route.params as ConnectorSelectorScreenNavParams;

  const items = matchingApps.map(app => ({
    label: app.displayName,
    value: app.address,
  }));

  return (
    <PageView>
      <DropdownSelectorTemplate
        message={I18n.get('pronote-connectorselector-title')}
        dropDownPickerProps={{
          items,
          placeholder: I18n.get('pronote-connectorselector-placeholder'),
          showTickIcon: false,
        }}
        button={{
          action: value => {
            if (value) openUrl(getPronoteRedirectUrl(value as string));
          },
          iconRight: 'pictos-external-link',
          text: I18n.get('pronote-connectorselector-action'),
        }}
      />
    </PageView>
  );
}
