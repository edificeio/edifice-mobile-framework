import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { PageView } from '~/framework/components/page';
import { tryAction } from '~/framework/util/redux/actions';
import { getUserSession } from '~/framework/util/session';
import {
  downloadThenOpenWorkspaceFileAction,
  downloadThenShareWorkspaceFileAction,
  downloadWorkspaceFilesAction,
} from '~/modules/workspace/actions';
import { renderImage } from '~/modules/workspace/components/image';
import { ButtonIconText } from '~/ui/ButtonIconText';

import styles from './styles';
import { IWorkspaceFilePreviewScreenProps } from './types';

const WorkspaceFilePreviewScreen = (props: IWorkspaceFilePreviewScreenProps) => {
  const preview = () => {
    props.previewFile(props.file);
  };

  const download = () => {
    props.downloadFile(props.file);
  };

  const share = () => {
    props.shareFile(props.file);
  };

  return (
    <PageView navigation={props.navigation} navBarWithBack={{ title: props.title }}>
      <TouchableOpacity onPress={preview}>{renderImage(props.file, false, props.file.name)}</TouchableOpacity>
      <View style={styles.actionsContainer}>
        {Platform.OS !== 'ios' ? (
          <ButtonIconText name="download" onPress={download}>
            {I18n.t('download')}
          </ButtonIconText>
        ) : null}
        <ButtonIconText name="share-variant" onPress={share}>
          {I18n.t('share')}
        </ButtonIconText>
      </View>
    </PageView>
  );
};

export default connect(
  (gs: IGlobalState, props: any) => {
    return {
      file: props.navigation.getParam('file'),
      title: props.navigation.getParam('title'),
      session: getUserSession(),
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        downloadFile: tryAction(downloadWorkspaceFilesAction, undefined, true),
        previewFile: tryAction(downloadThenOpenWorkspaceFileAction, undefined, true),
        shareFile: tryAction(downloadThenShareWorkspaceFileAction, undefined, true),
      },
      dispatch,
    ),
)(WorkspaceFilePreviewScreen);
