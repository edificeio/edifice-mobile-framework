import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold } from '~/framework/components/text';
import { CommonStyles } from '~/styles/common/styles';
import { DialogButtonOk, DialogContainer, DialogTitle } from '~/ui/ConfirmDialog';
import { actionTypesUpload } from '~/workspace/actions/upload';
import { resetError } from '~/workspace/reducers/items';

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { marginRight: 10 },
  overflowText: { padding: 10 },
});

export type IUploadErrorWrapperProps<T extends object> = T & {
  visible: boolean;
} & {
  resetError: Function;
};

function withUploadErrorWrapper<T extends object>(
  WrappedComponent: React.ComponentType<T>,
): React.ComponentType<IUploadErrorWrapperProps<T>> {
  return class extends React.Component<IUploadErrorWrapperProps<T>> {
    render() {
      const { visible, resetError, ...rest } = this.props;
      return (
        <View style={styles.container}>
          {visible && (
            <DialogContainer visible>
              <DialogTitle>
                <View style={styles.title}>
                  <Icon name="warning" size={18} color={CommonStyles.orangeColorTheme} />
                </View>
                <TextBold>{I18n.t('workspace.quota.overflowTitle')}</TextBold>
              </DialogTitle>
              <View style={styles.overflowText}>
                <Text>{I18n.t('workspace.quota.overflowText')}</Text>
              </View>
              <DialogButtonOk label={I18n.t('common-ok')} onPress={() => this.props.resetError()} />
            </DialogContainer>
          )}
          <WrappedComponent {...rest} />
        </View>
      );
    }
  };
}

const mapStateToProps = (state: any) => {
  const error = state.workspace.items.error;
  const visible =
    !!error &&
    error.type === actionTypesUpload.fetchError &&
    typeof error.errmsg === 'string' &&
    error.errmsg.includes('file.too.large');
  return {
    visible,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ resetError }, dispatch);
};

export default (wrappedComponent: React.ComponentType<any>): React.ComponentType<any> =>
  connect(mapStateToProps, mapDispatchToProps)(withUploadErrorWrapper(wrappedComponent));
