import * as React from "react";
import { EVENT_TYPE, IDetailsProps, IFile } from "../types";
import { ItemDetails } from "../components";
import { shareAction } from "../../infra/actions/share";
import withMenuWrapper from "../utils/withMenuWrapper";
import { newDownloadThenOpenAction } from "../actions/download";
import { connect } from "react-redux";

class Details extends React.PureComponent<IDetailsProps> {
  public handleEvent({ type, item }) {
    switch (type) {
      case EVENT_TYPE.DOWNLOAD: {
        console.log(this.props);
        this.props.dispatch(newDownloadThenOpenAction('', {item: item as IFile} ))
        return;
      }
      case EVENT_TYPE.PREVIEW: {
        console.log(this.props);
        this.props.dispatch(newDownloadThenOpenAction('', { item: item as IFile }))
        return;
      }
      case EVENT_TYPE.SHARE: {
        this.props.dispatch(shareAction(item as IFile));
      }
    }
  }

  public render() {
    const item = this.props.navigation.getParam("item");
    return <ItemDetails item={item} onEvent={this.handleEvent.bind(this)} />;
  }
}

export default withMenuWrapper(connect(() => {}, (dispatch) => ({dispatch}))(Details));
