import * as React from 'react';
import { ColorValue } from 'react-native';
import Pdf from 'react-native-pdf';

import theme from '~/app/theme';

import { BackdropModal } from './backdropModal';
import { EmptyContentScreen } from './emptyContentScreen';

export interface IBackdropPdfReaderProps {
  handleClose: () => void;
  handleOpen: () => void;
  headerColor?: ColorValue;
  indicatorColor?: ColorValue;
  title?: string;
  uri: string;
  visible: boolean;
}

export interface IBackdropPdfReaderState {
  error: boolean;
}

export class BackdropPdfReader extends React.PureComponent<IBackdropPdfReaderProps, IBackdropPdfReaderState> {
  state: IBackdropPdfReaderState = {
    error: false,
  };

  render() {
    const { handleOpen, handleClose, headerColor, indicatorColor, title, uri, visible } = this.props;
    const { error } = this.state;
    return (
      <BackdropModal
        content={
          error ? (
            <EmptyContentScreen />
          ) : (
            <Pdf
              activityIndicatorProps={{
                color: theme.ui.text.light,
                progressTintColor: theme.palette.primary.regular,
              }}
              source={{ cache: true, uri }}
              style={{ flex: 1, backgroundColor: theme.palette.grey.fog }}
              trustAllCerts={false}
              onError={_ => {
                // Note: when the backdrop is dimissed, the "uri" prop becomes undefined and onError activates;
                // therefore, we only use setState if the modal is displayed (the "visible" prop is true).
                if (visible) this.setState({ error: true });
              }}
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
