import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import {
  downloadThenOpenWorkspaceFileAction,
  downloadThenShareWorkspaceFileAction,
  downloadWorkspaceFilesAction,
} from '~/modules/workspace/actions';
import { renderImage } from '~/modules/workspace/components/image';
import { IFile } from '~/modules/workspace/reducer';
import { ButtonIconText } from '~/ui/ButtonIconText';

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 90,
  },
});

interface IWorkspaceFileDetailsEventProps {
  downloadFile: (file: IFile) => void;
  previewFile: (file: IFile) => void;
  shareFile: (file: IFile) => void;
  dispatch: ThunkDispatch<any, any, any>;
}

type IWorkspaceFileDetailsProps = {
  file: IFile;
  title: string;
  dispatch: ThunkDispatch<any, any, any>;
} & NavigationInjectedProps &
  IWorkspaceFileDetailsEventProps;

const WorkspaceFileDetails: React.FunctionComponent<IWorkspaceFileDetailsProps> = (props: IWorkspaceFileDetailsProps) => {
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

const mapStateToProps = (state: any, props: any) => {
  return {
    file: props.navigation.getParam('file'),
    title: props.navigation.getParam('title'),
    session: getUserSession(),
  };
};

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => IWorkspaceFileDetailsEventProps = (dispatch, getState) => ({
  downloadFile: async (file: IFile) => {
    return dispatch(downloadWorkspaceFilesAction([file]));
  },
  previewFile: async (file: IFile) => {
    return dispatch(downloadThenOpenWorkspaceFileAction(file));
  },
  shareFile: async (file: IFile) => {
    return dispatch(downloadThenShareWorkspaceFileAction(file));
  },
  dispatch,
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkspaceFileDetails);
