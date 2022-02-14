import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, SafeAreaView, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { UserCard } from './UserCard';

import { alternativeNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';
import { PageContainer } from '~/ui/ContainerContent';
import { H4 } from '~/ui/Typography';
import { HeaderBackAction } from '~/ui/headers/NewHeader';

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

export class ChildrenPage extends React.PureComponent<IChildrenPageProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t('directory-childrenTitle'),
        headerLeft: <HeaderBackAction navigation={navigation} />,
      },
      navigation,
    );
  };

  render() {
    return (
      <PageContainer>
        <DEPRECATED_ConnectionTrackingBar />
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
      </PageContainer>
    );
  }
}
