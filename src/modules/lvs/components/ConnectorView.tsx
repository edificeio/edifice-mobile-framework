import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { FlatButton } from '~/ui/FlatButton';
import { Loading } from '~/ui/Loading';
import { ErrorMessage } from '~/ui/Typography';

interface IConnectorViewDataProps {
  error: string;
  isLoading: boolean;
}

interface IConnectorViewEventProps {
  openConnector: () => void;
}

type IConnectorViewProps = IConnectorViewDataProps & IConnectorViewEventProps;

const styles = StyleSheet.create({
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorText: {
    marginBottom: UI_SIZES.spacing.big,
    width: '70%',
  },
});

class ConnectorView extends React.PureComponent<IConnectorViewProps> {
  public componentDidMount() {
    this.props.openConnector();
  }

  private renderError() {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage style={styles.errorText}>{I18n.t('connector-connectFailed')}</ErrorMessage>
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
