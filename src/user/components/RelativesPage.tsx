import I18n from 'i18n-js';
import * as React from 'react';
import { FlatList, View } from 'react-native';
import { NavigationInjectedProps, NavigationState } from 'react-navigation';

import { UI_SIZES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';

import UserCard from './user-card';

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
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('directory-relativesTitle'),
        }}>
        {this.props.relatives ? (
          <FlatList
            alwaysBounceVertical={false}
            overScrollMode="never"
            data={this.props.relatives}
            keyExtractor={item => item.id}
            renderItem={({ item: user }) => (
              <View style={{ marginBottom: UI_SIZES.spacing.medium }} key={user.id}>
                <UserCard id={user.id} displayName={user.displayName} type="Relative" />
              </View>
            )}
            ListFooterComponent={<View style={{ paddingBottom: UI_SIZES.screen.bottomInset }} />}
            contentContainerStyle={{ marginTop: UI_SIZES.spacing.large }}
          />
        ) : null}
      </PageView>
    );
  }
}
