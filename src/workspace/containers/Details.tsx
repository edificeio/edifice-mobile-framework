import * as React from "react";
import { Platform } from "react-native";
import { EVENT_TYPE, IDetailsProps, IFile } from "../types";
import { ItemDetails } from "../components";
import { openPreview, downloadFile } from "../../infra/actions/downloadHelper";
import { share } from "../../infra/actions/share";

export class Details extends React.PureComponent<IDetailsProps> {

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
