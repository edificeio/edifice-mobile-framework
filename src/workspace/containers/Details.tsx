import * as React from "react";
import { connect } from "react-redux";
import { NavigationScreenProp } from "react-navigation";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction } from "../../ui/headers/NewHeader";
import { ViewStyle, Platform } from "react-native";
import { EVENT_TYPE, IDetailsProps, IFile } from "../types";
import { ItemDetails } from "../components";
import { openPreview, startDownload, openDownloadedFile } from "../../infra/actions/downloadHelper";
import { share } from "../../infra/actions/share";

const HeaderBackAction = ({ navigation, style }: { navigation: NavigationScreenProp<{}>; style?: ViewStyle }) => {
  return <HeaderAction onPress={() => navigation.pop()} name={"back"} style={style} />;
};

export class Details extends React.PureComponent<IDetailsProps> {

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return standardNavScreenOptions(
      {
        title: navigation.getParam("title"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
      },
      navigation
    );
  };

  public onEvent(type: EVENT_TYPE, item: IFile) {
    switch (type) {
      case EVENT_TYPE.DOWNLOAD: {
        if(Platform.OS == "ios") {
          startDownload(item).then(res => openDownloadedFile(res.path()));
        } else {
          startDownload(item);
        }
        return;
      }
      case EVENT_TYPE.PREVIEW: {
        if(Platform.OS != "ios") {
          openPreview(item);
        }
        return;
      }
      case EVENT_TYPE.SHARE: {
        share(item);
        return;
      }
    }
  }

  public render() {
    const item = this.props.navigation.getParam("item");
    return <ItemDetails {...item} onEvent={this.onEvent} />;
  }
}

const mapStateToProps = (state: any, props: any) => {
  return null;
};

const mapDispatchToProps = (dispatch: any) => {
  return null;
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Details);
