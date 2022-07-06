import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import { shareAction } from '~/infra/actions/share';
import { downloadAndSaveAction, newDownloadThenOpenAction } from '~/modules/workspace/actions/download';
import { IFile } from '~/modules/workspace/types';
import { renderImage } from '~/modules/workspace/utils/image';
import { ButtonIconText } from '~/ui/ButtonIconText';

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

type IWorkspaceFileDetailsProps = {
  dispatch: ThunkDispatch<any, any, any>;
} & NavigationInjectedProps;

const WorkspaceFileDetails: React.FunctionComponent<IWorkspaceFileDetailsProps> = (props: IWorkspaceFileDetailsProps) => {
  const file = props.navigation.getParam('file');
  const title = props.navigation.getParam('title');

  const preview = () => {
    props.dispatch(newDownloadThenOpenAction('', { item: file as IFile }));
  };

  const download = () => {
    props.dispatch(downloadAndSaveAction({ item: file as IFile }));
  };

  const share = () => {
    props.dispatch(shareAction(file as IFile));
  };

  return (
    <PageView navigation={props.navigation} navBarWithBack={{ title }}>
      <TouchableOpacity onPress={preview}>{renderImage(file, false, file.name)}</TouchableOpacity>
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
  () => ({
    session: getUserSession(),
  }),
  dispatch => ({ dispatch }),
)(WorkspaceFileDetails);
