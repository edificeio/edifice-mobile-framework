import I18n from 'i18n-js';
import * as React from 'react';
import { ScrollView, SafeAreaView, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import { Text, NestedText, TextColorStyle } from '~/framework/components/text';
import { alternativeNavScreenOptions } from '~/navigation/helpers/navScreenOptions';
import { CommonStyles } from '~/styles/common/styles';
import { ContainerView } from '~/ui/ButtonLine';
import DEPRECATED_ConnectionTrackingBar from '~/ui/ConnectionTrackingBar';
import { PageContainer } from '~/ui/ContainerContent';
import { H4 } from '~/ui/Typography';
import { HeaderBackAction } from '~/ui/headers/NewHeader';

// TYPES ------------------------------------------------------------------------------------------

export interface IStructuresPageProps {
  schools: {
    id: string;
    name: string;
    classes: string[];
  }[];
}

// COMPONENT --------------------------------------------------------------------------------------

export class StructuresPage extends React.PureComponent<IStructuresPageProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t('directory-structuresTitle'),
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
            <H4>{I18n.t('structuresTitle')}</H4>
            {this.props.schools
              ? this.props.schools.map(school => (
                  <View key={school.id}>
                    <ContainerView>
                      <Text style={{ ...TextColorStyle.Light }}>{school.name}</Text>
                    </ContainerView>
                    <View
                      style={{
                        marginLeft: 40,
                        marginRight: 20,
                        marginVertical: 10,
                      }}>
                      {school.classes
                        ? school.classes.map(classe => (
                            <View key={classe}>
                              <Text>
                                <NestedText style={{ color: CommonStyles.profileTypes.Student }}>◆ </NestedText>
                                {classe}
                              </Text>
                            </View>
                          ))
                        : null}
                    </View>
                  </View>
                ))
              : null}
          </SafeAreaView>
        </ScrollView>
      </PageContainer>
    );
  }
}
