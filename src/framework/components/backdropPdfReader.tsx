import * as React from 'react';
import { ColorValue } from 'react-native';
import Pdf from 'react-native-pdf';

import theme from '~/app/theme';
import { openUrl } from '~/framework/util/linking';

import { IUserSession } from '../util/session';
import { BackdropModal } from './backdropModal';
import { EmptyConnectionScreen } from './emptyConnectionScreen';

export interface IBackdropPdfReaderProps {
  handleClose: () => void;
  handleOpen: () => void;
  headerColor?: ColorValue;
  indicatorColor?: ColorValue;
  title?: string;
  uri?: string;
  visible: boolean;
}

export interface IBackdropPdfReaderState {
  error: boolean;
}

export class BackdropPdfReader extends React.PureComponent<IBackdropPdfReaderProps, IBackdropPdfReaderState> {
  state: IBackdropPdfReaderState = {
    error: false,
  };

  handleError() {
    // Note: when the backdrop is dimissed, the "uri" prop becomes undefined and onError activates;
    // therefore, we only use setState if the modal is displayed (the "visible" prop is true).
    const { visible } = this.props;
    if (visible) this.setState({ error: true });
  }

  handlePressLink(
    uri: string | ((session: IUserSession) => string | false | Promise<string | false | undefined> | undefined) | undefined,
  ) {
    openUrl(uri);
  }

  render() {
    const { handleOpen, handleClose, headerColor, indicatorColor, title, uri, visible } = this.props;
    const { error } = this.state;
    return (
      <BackdropModal
        content={
          error ? (
            <EmptyConnectionScreen />
          ) : (
            <Pdf
              activityIndicatorProps={{
                color: theme.ui.text.light,
                progressTintColor: theme.palette.primary.regular,
              }}
              source={{ cache: true, uri }}
              style={{ flex: 1, backgroundColor: theme.palette.grey.fog }}
              trustAllCerts={false}
              onError={this.handleError}
              onPressLink={this.handlePressLink}
            />
          )
        }
        contentStyle={{ height: '90%' }}
        handleClose={handleClose}
        handleOpen={handleOpen}
        headerColor={headerColor}
        indicatorColor={indicatorColor}
        propagateSwipe
        title={title}
        visible={visible}
      />
    );
  }
}
