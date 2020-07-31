import React from "react";
import { View } from "react-native";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../styles/common/styles";
import { Icon } from "../../ui";
import { HeaderBackAction } from "../../ui/headers/NewHeader";
import NewMailComponent from "../components/NewMail";

type NewMailContainerProps = object;

type NewMailContainerState = object;

class NewMailContainer extends React.PureComponent<NewMailContainerProps, NewMailContainerState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: "",
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: (
          <View style={{ flexDirection: "row", marginRight: 7, justifyContent: "space-between" }}>
            <Icon name="outbox" size={24} color="white" style={{ marginLeft: 10 }} />
            <Icon name="attachment" size={24} color="white" style={{ marginLeft: 10 }} />
            <Icon name="more_vert" size={24} color="white" style={{ marginLeft: 5 }} />
          </View>
        ),
        headerStyle: {
          backgroundColor: CommonStyles.secondary,
        },
      },
      navigation
    );
  };

  public render() {
    return <NewMailComponent />;
  }
}

const mapStateToProps = (state: any) => {
  return {};
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(NewMailContainer);
