import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, SafeAreaView, View } from 'react-native';
import { NavigationInjectedProps, NavigationState } from 'react-navigation';

import { UserCard } from './UserCard';

import { H4 } from '~/ui/Typography';
import { HeaderBackAction } from '~/ui/headers/NewHeader';
import { PageView } from '~/framework/components/page';

// TYPES ------------------------------------------------------------------------------------------

export interface IChildrenPageProps {
  schools: {
    structureName: string;
    children: {
      displayName: string;
      id: string;
    }[];
  }[];
}

// COMPONENT --------------------------------------------------------------------------------------

export class ChildrenPage extends React.PureComponent<IChildrenPageProps & NavigationInjectedProps<NavigationState>> {
  render() {
    return (
      <PageView
        path={this.props.navigation.state.routeName}
        navBar={{
          left: <HeaderBackAction navigation={this.props.navigation} />,
          title: I18n.t('directory-childrenTitle'),
        }}>
        <ScrollView alwaysBounceVertical={false}>
          <SafeAreaView>
            {this.props.schools
              ? this.props.schools.map(school => {
                  return (
                    <View key={school.structureName}>
                      <H4>{school.structureName}</H4>
                      {school.children
                        ? school.children.map(user => {
                            return (
                              <View style={{ marginBottom: 15 }} key={user.id}>
                                <UserCard id={user.id} displayName={user.displayName} type="Student" />
                              </View>
                            );
                          })
                        : null}
                    </View>
                  );
                })
              : null}
          </SafeAreaView>
        </ScrollView>
      </PageView>
    );
  }
}
