import * as React from 'react';
import { StyleSheet } from 'react-native';

import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import Pdf, { PdfProps } from 'react-native-pdf';

import theme from '~/app/theme';
import { EmptyConnectionScreen } from '~/framework/components/empty-screens';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { navigate } from '~/framework/navigation/helper';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { navBarOptions } from '~/framework/navigation/navBar';
import { openUrl } from '~/framework/util/linking';
import { toURISource } from '~/framework/util/media';
import { accountURISource } from '~/framework/util/transport';

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

  handlePressLink(uri: string) {
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
    const session = getSession();
    let source: Exclude<PdfProps['source'], number>;
    if (session && uri) {
      source = accountURISource(session, toURISource(uri));
    } else {
      source = { uri };
    }
    const { error } = this.state;
    if (error) return this.renderError();
    return (
      <PageView>
        <Pdf
          source={{ cache: false, ...source }}
          style={styles.pdf}
          trustAllCerts={false}
          onError={() => this.setState({ error: true })}
          onPressLink={this.handlePressLink}
          renderActivityIndicator={this.renderLoading}
        />
      </PageView>
    );
  }
}

export function openPDFReader(navParams: IModalsNavigationParams[ModalsRouteNames.Pdf]) {
  navigate(ModalsRouteNames.Pdf, navParams);
}
