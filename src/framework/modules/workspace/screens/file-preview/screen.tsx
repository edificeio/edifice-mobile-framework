import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { UI_STYLES } from '~/framework/components/constants';
import { PageView } from '~/framework/components/page';
import {
  downloadThenOpenWorkspaceFileAction,
  downloadThenShareWorkspaceFileAction,
  downloadWorkspaceFilesAction,
} from '~/framework/modules/workspace/actions/fileTransfer';
import { renderImage } from '~/framework/modules/workspace/components/image';
import { WorkspaceNavigationParams, workspaceRouteNames } from '~/framework/modules/workspace/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { tryActionLegacy } from '~/framework/util/redux/actions';
import { ButtonIconText } from '~/ui/ButtonIconText';

import styles from './styles';
import { IWorkspaceFilePreviewScreenProps } from './types';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<WorkspaceNavigationParams, typeof workspaceRouteNames.filePreview>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: route.params.title,
  }),
});

const WorkspaceFilePreviewScreen = (props: IWorkspaceFilePreviewScreenProps) => {
  const preview = () => {
    props.previewFile(props.file, props.navigation);
  };

  const download = () => {
    props.downloadFile([props.file]);
  };

  const share = () => {
    props.shareFile(props.file);
  };

  React.useEffect(() => {
    props.navigation.setParams({
      title: props.title,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.title]);

  return (
    <PageView>
      <TouchableOpacity onPress={preview} style={UI_STYLES.flexGrow1}>
        {renderImage(props.file, false, props.file.name)}
      </TouchableOpacity>
      <View style={styles.actionsContainer}>
        {Platform.OS !== 'ios' ? (
          <ButtonIconText name="download" onPress={download}>
            {I18n.get('workspace-filepreview-download')}
          </ButtonIconText>
        ) : null}
        <ButtonIconText name="share-variant" onPress={share}>
          {I18n.get('workspace-filepreview-share')}
        </ButtonIconText>
      </View>
    </PageView>
  );
};

export default connect(
  (gs: IGlobalState, props: any) => {
    return {
      file: props.route.params.file,
      title: props.route.params.title,
    };
  },
  (dispatch: ThunkDispatch<any, any, any>) =>
    bindActionCreators(
      {
        downloadFile: tryActionLegacy(
          downloadWorkspaceFilesAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFilePreviewScreenProps['downloadFile'],
        previewFile: tryActionLegacy(
          downloadThenOpenWorkspaceFileAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFilePreviewScreenProps['previewFile'],
        shareFile: tryActionLegacy(
          downloadThenShareWorkspaceFileAction,
          undefined,
          true,
        ) as unknown as IWorkspaceFilePreviewScreenProps['shareFile'],
      },
      dispatch,
    ),
)(WorkspaceFilePreviewScreen);
