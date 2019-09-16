import I18n from "i18n-js";
import * as React from "react";
import { PageContainer } from "../../ui/ContainerContent";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { ScrollView, SafeAreaView, View } from "react-native";
import { Text, TextColor, NestedText } from "../../ui/text";
import { ContainerView, ContainerSpacer } from "../../ui/ButtonLine";
import { CommonStyles } from "../../styles/common/styles";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navHelper";
import { NavigationScreenProp } from "react-navigation";
import { HeaderBackAction } from "../../ui/headers/NewHeader";
import { H4 } from "../../ui/Typography";

// TYPES ------------------------------------------------------------------------------------------

export interface IStructuresPageProps {
  schools: Array<{
    id: string;
    name: string;
    classes: string[]
  }>;
}

// COMPONENT --------------------------------------------------------------------------------------

export class StructuresPage extends React.PureComponent<IStructuresPageProps>{

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t("directory-structuresTitle"),
        headerLeft: <HeaderBackAction navigation={navigation} />
      },
      navigation
    );
  };

  render() {
    return <PageContainer>
      <ConnectionTrackingBar/>
      <ScrollView alwaysBounceVertical={false}>
        <SafeAreaView>
          <H4>{I18n.t("structuresTitle")}</H4>
          {this.props.schools ? this.props.schools.map(school => <View key={school.id}>
            <ContainerView>
              <Text color={TextColor.Light}>{school.name}</Text>
            </ContainerView>
            <View style={{
              marginLeft: 40,
              marginRight: 20,
              marginVertical: 10
            }}>
              {school.classes ? school.classes.map(classe => <View key={classe}>
                <Text>
                  <NestedText style={{ color: CommonStyles.profileTypes.Student }}>◆ </NestedText>
                  {classe}
                </Text>
              </View>) : null}
            </View>
          </View>) : null}
        </SafeAreaView>
      </ScrollView>
    </PageContainer>;
  }
}