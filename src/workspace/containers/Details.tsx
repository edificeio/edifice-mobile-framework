import * as React from "react";
import { connect } from "react-redux";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { StyleSheet, View, ViewStyle } from "react-native";
import { EVENT_TYPE, IDetailsProps, IFile } from "../types";
import { ItemDetails } from "../components";
import { startDownload } from "../../infra/actions/downloadHelper";

const HeaderBackAction = ({ navigation, style }: {
  navigation: NavigationScreenProp<{}>, style?: ViewStyle
}) => {
  return (
    <HeaderAction onPress={() => navigation.pop()} name={"back"} style={style}/>
  )
};

const styles = StyleSheet.create({
  mainPanel: {
    backgroundColor: "#FFF6F8",
    flex: 1
  }
});

export class Details extends React.PureComponent<IDetailsProps> {
  readonly state = { inProgress: true};

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return standardNavScreenOptions(
      {
        title: navigation.getParam("title"),
        headerLeft: <HeaderBackAction navigation={navigation}/>,
      },
      navigation
    );
  };

  public onEvent( type: EVENT_TYPE, item: IFile) {
    switch(type) {
      case EVENT_TYPE.DOWNLOAD:
        startDownload(item)
      case EVENT_TYPE.SHARE:
        return
    }
  }

  public render() {
    const item = this.props.navigation.getParam("item");
    return (
      <View style={styles.mainPanel}>
        <ItemDetails {...item} onEvent={this.onEvent}/>
      </View>
    );
  }
}

const mapStateToProps = (state: any, props: any) => {
  return null;
}


const mapDispatchToProps = (dispatch: any) => {
  return null
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Details);

