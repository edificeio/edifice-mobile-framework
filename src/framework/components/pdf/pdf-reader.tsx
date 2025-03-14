import * as React from 'react';
import { StyleSheet } from 'react-native';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import Pdf from 'react-native-pdf';

import theme from '~/app/theme';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { navigate } from '~/framework/navigation/helper';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';

export interface PDFReaderState {
  error: boolean;
}

const styles = StyleSheet.create({
  pdf: { backgroundColor: theme.palette.grey.fog, flex: 1 },
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
  PDFReaderState
> {
  state: PDFReaderState = {
    error: false,
  };

  handlePressLink(
    uri: string | ((session: AuthLoggedAccount) => string | false | Promise<string | false | undefined> | undefined) | undefined,
  ) {
    openUrl(uri);
  }

  renderError() {
    return <EmptyConnectionScreen />;
  }

  renderLoading() {
    return <LoadingIndicator />;
  }

  render() {
    const { src: uri } = this.props.route.params;
    const { error } = this.state;
    if (error) return this.renderError();
    return (
      <Pdf
        source={{ cache: false, uri }}
        style={styles.pdf}
        trustAllCerts={false}
        onError={() => this.setState({ error: true })}
        onPressLink={this.handlePressLink}
        renderActivityIndicator={this.renderLoading}
      />
    );
  }
}

export function openPDFReader(navParams: IModalsNavigationParams[ModalsRouteNames.Pdf]) {
  navigate(ModalsRouteNames.Pdf, navParams);
}
