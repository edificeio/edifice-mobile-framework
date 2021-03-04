import I18n from "i18n-js";
import * as React from "react";
import { PageContainer } from "../../ui/ContainerContent";
import DEPRECATED_ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { ScrollView, SafeAreaView, View } from "react-native";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { NavigationScreenProp } from "react-navigation";
import { HeaderBackAction } from "../../ui/headers/NewHeader";
import { UserCard } from "./UserCard";

// TYPES ------------------------------------------------------------------------------------------

export interface IRelativesPageProps {
  relatives: Array<{
    displayName: string;
    id: string;
  }>;
}

// COMPONENT --------------------------------------------------------------------------------------

export class RelativesPage extends React.PureComponent<IRelativesPageProps>{

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return alternativeNavScreenOptions(
      {
        title: I18n.t("directory-relativesTitle"),
        headerLeft: <HeaderBackAction navigation={navigation} />
      },
      navigation
    );
  };

  render() {
    return <PageContainer>
      <DEPRECATED_ConnectionTrackingBar/>
      <ScrollView alwaysBounceVertical={false}>
        <View style={{marginTop: 40}}></View>
        <SafeAreaView>
          {this.props.relatives && this.props.relatives.map(user => {
            return <View style={{ marginBottom: 15 }} key={user.id}>
              <UserCard id={user.id} displayName={user.displayName} type="Relative" />
            </View>;
          })}
        </SafeAreaView>
      </ScrollView>
    </PageContainer>;
  }
}