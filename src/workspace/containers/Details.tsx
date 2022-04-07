import * as React from 'react';
import { connect } from 'react-redux';

import { shareAction } from '~/infra/actions/share';
import { downloadAndSaveAction, newDownloadThenOpenAction } from '~/workspace/actions/download';
import { ItemDetails } from '~/workspace/components';
import { EVENT_TYPE, IDetailsProps, IFile } from '~/workspace/types';
import withMenuWrapper from '~/workspace/utils/withMenuWrapper';

class Details extends React.PureComponent<IDetailsProps> {
  public handleEvent({ type, item }) {
    switch (type) {
      case EVENT_TYPE.DOWNLOAD: {
        this.props.dispatch(downloadAndSaveAction({ item: item as IFile }));
        return;
      }
      case EVENT_TYPE.PREVIEW: {
        this.props.dispatch(newDownloadThenOpenAction('', { item: item as IFile }));
        return;
      }
      case EVENT_TYPE.SHARE: {
        this.props.dispatch(shareAction(item as IFile));
      }
    }
  }

  public render() {
    const item = this.props.navigation.getParam('item');
    return <ItemDetails item={item} onEvent={this.handleEvent.bind(this)} />;
  }
}

export default withMenuWrapper(
  connect(
    () => {},
    dispatch => ({ dispatch }),
  )(Details),
);
