import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { PageView } from '~/framework/components/page';
import { getUserSession } from '~/framework/util/session';
import { shareAction } from '~/infra/actions/share';
import { ButtonIconText } from '~/ui/ButtonIconText';

import { downloadAndSaveAction, newDownloadThenOpenAction } from '../actions/download';
import { IFile } from '../types';
import { renderImage } from '../components/image';

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 90,
  },
});

type IWorkspaceFileDetailsProps = {
  file: IFile;
  title: string;
  dispatch: ThunkDispatch<any, any, any>;
} & NavigationInjectedProps;

const WorkspaceFileDetails: React.FunctionComponent<IWorkspaceFileDetailsProps> = ({
  file,
  navigation,
  title,
  dispatch,
}: IWorkspaceFileDetailsProps) => {
  const preview = () => {
    dispatch(newDownloadThenOpenAction({ item: file }));
  };

  const download = () => {
    dispatch(downloadAndSaveAction({ item: file }));
  };

  const share = () => {
    dispatch(shareAction(file));
  };

  return (
    <PageView navigation={navigation} navBarWithBack={{ title }}>
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

const mapStateToProps = (state: any, props: any) => {
  return {
    file: props.navigation.getParam('file'),
    title: props.navigation.getParam('title'),
    session: getUserSession(),
  };
};

export default connect(mapStateToProps, dispatch => ({ dispatch }))(WorkspaceFileDetails);
