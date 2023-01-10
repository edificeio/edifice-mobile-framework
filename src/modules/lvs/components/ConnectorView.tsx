import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { Loading } from '~/ui/Loading';

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
    flexGrow: 0,
    marginTop: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.tiny,
    textAlign: 'center',
    alignSelf: 'center',
    color: theme.palette.status.failure.regular,
  },
});

class ConnectorView extends React.PureComponent<IConnectorViewProps> {
  public componentDidMount() {
    this.props.openConnector();
  }

  private renderError() {
    return (
      <View style={styles.errorContainer}>
        <SmallText style={styles.errorText}>{I18n.t('connector-connectFailed')}</SmallText>
        <ActionButton action={this.props.openConnector} text={I18n.t('tryagain')} loading={this.props.isLoading} />
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
