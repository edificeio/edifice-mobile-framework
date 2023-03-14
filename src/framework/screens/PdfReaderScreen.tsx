import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';

import theme from '~/app/theme';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { navigate } from '~/framework/navigation/helper';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

import { ISession } from '../modules/auth/model';
import { openUrl } from '../util/linking';

export interface IBackdropPdfReaderState {
  error: boolean;
}

const styles = StyleSheet.create({
  pdf: { flex: 1, backgroundColor: theme.palette.grey.fog },
});

export class BackdropPdfReaderScreen extends React.PureComponent<
  NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.Pdf>,
  IBackdropPdfReaderState
> {
  state: IBackdropPdfReaderState = {
    error: false,
  };

  handleError(err: any) {
    this.setState({ error: !!err });
  }

  handlePressLink(
    uri: string | ((session: ISession) => string | false | Promise<string | false | undefined> | undefined) | undefined,
  ) {
    openUrl(uri);
  }

  render() {
    const { src: uri } = this.props.route.params;
    const { error } = this.state;
    return error ? (
      <EmptyConnectionScreen />
    ) : (
      <Pdf
        activityIndicatorProps={{
          color: theme.ui.text.light,
          progressTintColor: theme.palette.primary.regular,
        }}
        source={{ cache: true, uri }}
        style={styles.pdf}
        onError={this.handleError}
        onPressLink={this.handlePressLink}
      />
    );
  }
}

export function openPdfReader(navParams: IModalsNavigationParams[ModalsRouteNames.Pdf]) {
  navigate(ModalsRouteNames.Pdf, navParams);
}
