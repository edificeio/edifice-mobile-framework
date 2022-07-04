import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';

import { shareAction } from '~/infra/actions/share';
import { downloadAndSaveAction, newDownloadThenOpenAction } from '~/modules/workspace/actions/download';
import { EVENT_TYPE, IDetailsProps, IFile } from '~/modules/workspace/types';
import { renderImage } from '~/modules/workspace/utils/image';
import withMenuWrapper from '~/modules/workspace/utils/withMenuWrapper';
import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import { ButtonIconText } from '~/ui/ButtonIconText';

const styles = StyleSheet.create({
  mainPanel: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: CommonStyles.lightGrey,
  },
  bodyPanel: {
    flex: 1,
    flexGrow: 1,
  },
  bottomPanel: {
    height: layoutSize.LAYOUT_80,
  },
  buttonPanel: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
  },
});

class WorkspaceFileDetails extends React.PureComponent<IDetailsProps> {
  public handleEvent({ type, item }) {
    switch (type) {
      case EVENT_TYPE.DOWNLOAD: {
        this.props.dispatch(downloadAndSaveAction({ item: item as IFile }));
        return;
      }
      case EVENT_TYPE.PREVIEW: {
        this.props.dispatch(newDownloadThenOpenAction('', { item: item as IFile }));
        return;
      }
      case EVENT_TYPE.SHARE: {
        this.props.dispatch(shareAction(item as IFile));
      }
    }
  }

  public render() {
    const item = this.props.navigation.getParam('item');

    return (
      <SafeAreaView style={styles.mainPanel}>
        <View style={styles.bodyPanel}>
          <TouchableOpacity onPress={() => this.handleEvent({ type: EVENT_TYPE.PREVIEW, item })}>
            {renderImage(item, false, item.name)}
          </TouchableOpacity>
        </View>
        <View style={styles.bottomPanel}>
          <View style={styles.buttonPanel}>
            {Platform.OS !== 'ios' ? (
              <ButtonIconText name="download" onPress={() => this.handleEvent({ type: EVENT_TYPE.DOWNLOAD, item })}>
                {I18n.t('download')}
              </ButtonIconText>
            ) : (
              <View />
            )}
            <ButtonIconText name="share-variant" onPress={() => this.handleEvent({ type: EVENT_TYPE.SHARE, item })}>
              {I18n.t('share')}
            </ButtonIconText>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

export default withMenuWrapper(
  connect(
    () => {},
    dispatch => ({ dispatch }),
  )(WorkspaceFileDetails),
);
