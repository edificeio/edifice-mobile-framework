import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { ViewStyle, Platform } from "react-native";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderAction, HeaderIcon } from "../../ui/headers/NewHeader";
import { EVENT_TYPE, IDetailsProps, IFile } from "../types";
import { ItemDetails } from "../components";
import { openPreview, downloadFile } from "../../infra/actions/downloadHelper";
import { share } from "../../infra/actions/share";

const HeaderBackAction = ({ navigation, style }: { navigation: any; style?: ViewStyle }) => {
  return <HeaderAction onPress={() => navigation.pop()} name="back" style={style} />;
};

export class Details extends React.PureComponent<IDetailsProps> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) => {
    return standardNavScreenOptions(
      {
        title: navigation.getParam("title"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
        headerRight: <HeaderIcon name={null} hidden />,
      },
      navigation
    );
  };

  public handleEvent({ type, item }) {
    switch (type) {
      case EVENT_TYPE.DOWNLOAD: {
        downloadFile(item as IFile);
        return;
      }
      case EVENT_TYPE.PREVIEW: {
        if (Platform.OS !== "ios") {
          openPreview(item as IFile);
        }
        return;
      }
      case EVENT_TYPE.SHARE: {
        share(item as IFile);
      }
    }
  }

  public render() {
    const item = this.props.navigation.getParam("item");
    return <ItemDetails item={item} onEvent={this.handleEvent} />;
  }
}
