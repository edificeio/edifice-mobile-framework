import I18n from 'i18n-js';
import * as React from 'react';
import { View } from 'react-native';

import { FlatButton, Loading } from '~/ui';
import { ErrorMessage } from '~/ui/Typography';

interface IConnectorViewDataProps {
  isLoading: boolean;
}

interface IConnectorViewEventProps {
  openConnector: () => void;
}

type IConnectorViewProps = IConnectorViewDataProps & IConnectorViewEventProps;

class ConnectorView extends React.PureComponent<IConnectorViewProps> {
  public componentDidMount() {
    this.props.openConnector();
  }

  private renderError() {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <ErrorMessage style={{ marginBottom: 20, width: '70%' }}>{I18n.t('connector-connectFailed')}</ErrorMessage>
        <FlatButton onPress={this.props.openConnector} title={I18n.t('tryagain')} loading={this.props.isLoading} />
      </View>
    );
  }

  private renderLoading() {
    return <Loading />;
  }

  public render() {
    const { isLoading, error } = this.props;

    if (error) {
      return this.renderError();
    } else if (isLoading) {
      return this.renderLoading();
    } else {
      return this.renderLoading();
    }
  }
}

export default ConnectorView;
