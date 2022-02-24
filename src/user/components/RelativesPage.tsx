import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, SafeAreaView, View } from 'react-native';
import { NavigationInjectedProps, NavigationState } from 'react-navigation';

import { UserCard } from './UserCard';

import { HeaderBackAction } from '~/ui/headers/NewHeader';
import { PageView } from '~/framework/components/page';

// TYPES ------------------------------------------------------------------------------------------

export interface IRelativesPageProps {
  relatives: {
    displayName: string;
    id: string;
  }[];
}

// COMPONENT --------------------------------------------------------------------------------------

export class RelativesPage extends React.PureComponent<IRelativesPageProps & NavigationInjectedProps<NavigationState>> {
  render() {
    return (
      <PageView
        path={this.props.navigation.state.routeName}
        navBar={{
          left: <HeaderBackAction navigation={this.props.navigation} />,
          title: I18n.t('directory-relativesTitle'),
        }}>
        <ScrollView alwaysBounceVertical={false}>
          <View style={{ marginTop: 40 }} />
          <SafeAreaView>
            {this.props.relatives &&
              this.props.relatives.map(user => {
                return (
                  <View style={{ marginBottom: 15 }} key={user.id}>
                    <UserCard id={user.id} displayName={user.displayName} type="Relative" />
                  </View>
                );
              })}
          </SafeAreaView>
        </ScrollView>
      </PageView>
    );
  }
}
