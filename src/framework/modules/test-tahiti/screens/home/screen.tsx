import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { ScrollView } from 'react-native';

import { ActionButton } from '~/framework/components/buttons/action';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { TestTahitiNavigationParams, testTahitiRouteNames } from '~/framework/modules/test-tahiti/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';

import type { TestTahitiHomeScreenPrivateProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<TestTahitiNavigationParams, typeof testTahitiRouteNames.home>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: 'Tests Polynésie',
  }),
});

export default function TestTahitiHomeScreen(props: TestTahitiHomeScreenPrivateProps) {
  return (
    <PageView>
      <ScrollView style={{ alignContent: 'center', paddingHorizontal: 24, paddingVertical: 12 }}>
        <BodyBoldText style={{ marginVertical: 12, textAlign: 'center' }}>
          This app is not dedicated to be released in PROD. Its purpose is to check an issue on our PROD app about webview display
          with a unique user.
        </BodyBoldText>
        <ActionButton
          iconName="ui-rafterRight"
          text="1. WAYF Polynésie"
          style={{ marginVertical: 12 }}
          action={() => {
            props.navigation.navigate(testTahitiRouteNames.webview, {
              title: 'WAYF Polynésie',
              url: 'https://nati.pf/auth/saml/wayf?#/',
            });
          }}
        />
        <ActionButton
          iconName="ui-rafterRight"
          text="2. Guichet académique"
          style={{ marginVertical: 12 }}
          action={() => {
            props.navigation.navigate(testTahitiRouteNames.webview, {
              title: 'Guichet académique',
              url: 'https://si1d.ac-polynesie.pf/login/ct_logon.jsp',
            });
          }}
        />
        <ActionButton
          iconName="ui-rafterRight"
          text="3. edifice.io"
          style={{ marginVertical: 12 }}
          action={() => {
            props.navigation.navigate(testTahitiRouteNames.webview, {
              title: 'edifice.io',
              url: 'https://edifice.io/',
            });
          }}
        />
        <ActionButton
          iconName="ui-rafterRight"
          text="4. wikipedia.org"
          style={{ marginVertical: 12 }}
          action={() => {
            props.navigation.navigate(testTahitiRouteNames.webview, { title: 'wikipedia.org', url: 'https://www.wikipedia.org/' });
          }}
        />
        <ActionButton
          iconName="ui-rafterRight"
          text="5. Office de tourisme"
          style={{ marginVertical: 12 }}
          action={() => {
            props.navigation.navigate(testTahitiRouteNames.webview, {
              title: 'Office de tourisme',
              url: 'https://tahititourisme.fr/fr-fr/',
            });
          }}
        />
        <ActionButton
          iconName="ui-rafterRight"
          text="6. Site local"
          style={{ marginVertical: 12 }}
          action={() => {
            props.navigation.navigate(testTahitiRouteNames.webview, {
              title: 'Site local',
              url: 'https://www.presidence.pf/presentation-de-lespace-numerique-de-travail-polynesien-ent/',
            });
          }}
        />
      </ScrollView>
    </PageView>
  );
}
