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

interface IWorkspaceFileDetailsScreen_DataProps {
  file: IFile;
  title: string;
}

interface IWorkspaceFileDetailsScreen_EventProps {
  downloadFile: (file: IFile) => void;
  previewFile: (file: IFile) => void;
  shareFile: (file: IFile) => void;
  dispatch: ThunkDispatch<any, any, any>;
}

type IWorkspaceFileDetailsScreen_Props = IWorkspaceFileDetailsScreen_DataProps &
  IWorkspaceFileDetailsScreen_EventProps &
  NavigationInjectedProps;

const WorkspaceFileDetails: React.FunctionComponent<IWorkspaceFileDetailsScreen_Props> = (
  props: IWorkspaceFileDetailsScreen_Props,
) => {
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
) => IWorkspaceFileDetailsScreen_EventProps = (dispatch, getState) => ({
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
