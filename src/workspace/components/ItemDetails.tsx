import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View, SafeAreaView, Platform } from 'react-native';

import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import { ButtonIconText } from '~/ui/ButtonIconText';
import { IEventProps, EVENT_TYPE } from '~/workspace/types';
import { IFile } from '~/workspace/types/states';
import { renderImage } from '~/workspace/utils/image';

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

export const ItemDetails = ({ onEvent, item }: IEventProps & any) => {
  const { name } = item as IFile;

  const getPreviewImage = () => (
    <TouchableOpacity onPress={() => onEvent({ type: EVENT_TYPE.PREVIEW, item })}>
      {renderImage(item, false, name)}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.mainPanel}>
      <View style={styles.bodyPanel}>{getPreviewImage()}</View>
      <View style={styles.bottomPanel}>
        <View style={styles.buttonPanel}>
          {Platform.OS !== 'ios' ? (
            <ButtonIconText name="download" onPress={() => onEvent({ type: EVENT_TYPE.DOWNLOAD, item })}>
              {I18n.t('download')}
            </ButtonIconText>
          ) : (
            <View />
          )}
          <ButtonIconText name="share-variant" onPress={() => onEvent({ type: EVENT_TYPE.SHARE, item })}>
            {I18n.t('share')}
          </ButtonIconText>
        </View>
      </View>
    </SafeAreaView>
  );
};
