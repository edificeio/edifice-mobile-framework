import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, SafeAreaView, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { UserCard } from './UserCard';

import { alternativeNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';
import { PageContainer } from '~/ui/ContainerContent';
import { HeaderBackAction } from '~/ui/headers/NewHeader';

// TYPES ------------------------------------------------------------------------------------------

export interface IRelativesPageProps {
  relatives: {
    displayName: string;
    id: string;
  }[];
}

// COMPONENT --------------------------------------------------------------------------------------

export class RelativesPage extends React.PureComponent<IRelativesPageProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t('directory-relativesTitle'),
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
      </PageContainer>
    );
  }
}
