import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';

import theme from '~/app/theme';
import { EmptyConnectionScreen } from '~/framework/components/emptyConnectionScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { ISession } from '~/framework/modules/auth/model';
import { navigate } from '~/framework/navigation/helper';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';

export interface IBackdropPdfReaderState {
  error: boolean;
}

const styles = StyleSheet.create({
  pdf: { flex: 1, backgroundColor: theme.palette.grey.fog },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<IModalsNavigationParams, typeof ModalsRouteNames.Pdf>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: route.params.title,
  }),
});

export class PDFReader extends React.PureComponent<
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

  renderLoading() {
    return <LoadingIndicator />;
  }

  render() {
    const { src: uri } = this.props.route.params;
    const { error } = this.state;
    return error ? (
      <EmptyConnectionScreen />
    ) : (
      <Pdf
        source={{ cache: true, uri }}
        style={styles.pdf}
        trustAllCerts={false}
        onError={this.handleError}
        onPressLink={this.handlePressLink}
        renderActivityIndicator={this.renderLoading}
      />
    );
  }
}

export function openPDFReader(navParams: IModalsNavigationParams[ModalsRouteNames.Pdf]) {
  navigate(ModalsRouteNames.Pdf, navParams);
}
