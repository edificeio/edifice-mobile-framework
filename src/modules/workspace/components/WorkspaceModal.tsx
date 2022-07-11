import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import ModalBox from '~/framework/components/ModalBox';
import { Text, TextSizeStyle } from '~/framework/components/text';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';

const styles = StyleSheet.create({
  titleText: {
    ...TextSizeStyle.SlightBig,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
});

export enum WorkspaceActionType {
  CREATE_FOLDER,
  DELETE,
  DOWNLOAD,
  DUPLICATE,
  EDIT,
  MOVE,
}

interface IWorkspaceModalProps {
  modalBoxRef: any;
}

export const WorkspaceModal = ({ modalBoxRef }: IWorkspaceModalProps) => (
  <ModalBox
    ref={modalBoxRef}
    content={
      <View>
        <Text style={styles.titleText}>TITLE</Text>
        <View style={styles.actionsContainer}>
          <DialogButtonCancel onPress={() => true} />
          <DialogButtonOk label={I18n.t('common.quit')} onPress={() => true} />
        </View>
      </View>
    }
  />
);
