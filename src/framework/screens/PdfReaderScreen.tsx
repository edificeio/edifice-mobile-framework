import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';

import theme from '~/app/theme';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { navigate } from '~/framework/navigation/helper';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';

import { EmptyConnectionScreen } from '../components/emptyConnectionScreen';

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
  // DECLARATIONS =================================================================================

  state: IBackdropPdfReaderState = {
    error: false,
  };

  // RENDER =======================================================================================

  render() {
    const { src: uri } = this.props.route.params;
    const { error } = this.state;
    return error ? (
      <EmptyContentScreen />
    ) : !uri ? (
      <EmptyConnectionScreen />
    ) : (
      <Pdf
        activityIndicatorProps={{
          color: theme.ui.text.light,
          progressTintColor: theme.palette.primary.regular,
        }}
        source={{ cache: true, uri }}
        style={styles.pdf}
        onError={err => {
          // Note: when the backdrop is dimissed, the "uri" prop becomes undefined and onError activates;
          // therefore, we only use setState if the modal is displayed (the "visible" prop is true).
          this.setState({ error: !!err });
        }}
      />
    );
  }
}

export function openPdfReader(navParams: IModalsNavigationParams[ModalsRouteNames.Pdf]) {
  navigate(ModalsRouteNames.Pdf, navParams);
}
