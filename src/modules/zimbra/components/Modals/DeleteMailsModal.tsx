import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold, TextSizeStyle } from '~/framework/components/text';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

const styles = StyleSheet.create({
  deleteTitleContainer: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    ...TextSizeStyle.SlightBig,
    marginLeft: 8, // MO-142 use UI_SIZES.spacing here
  },
  messageContainer: {
    width: '100%',
    marginBottom: 35, // MO-142 use UI_SIZES.spacing here
    paddingHorizontal: 20, // MO-142 use UI_SIZES.spacing here
  },
  actionsButtonsContainer: {
    alignSelf: 'flex-end',
  },
});

export const ModalPermanentDelete = ({
  deleteModal,
  closeModal,
  actionsDeleteSuccess,
}: {
  deleteModal: { isShown: boolean; mailsIds: string[] };
  closeModal: () => void;
  actionsDeleteSuccess: (mailsIds: string[]) => void;
}) => (
  <ModalBox isVisible={deleteModal.isShown} backdropOpacity={0.5}>
    <ModalContent style={{ width: useWindowDimensions().width - 60 }}>
      <View style={styles.deleteTitleContainer}>
        <ModalContentBlock style={styles.row}>
          <Icon size={18} name="warning" color={theme.palette.secondary.regular} />
          <TextBold style={styles.titleText}>{I18n.t('zimbra-message-deleted-confirm')}</TextBold>
        </ModalContentBlock>
      </View>
      <View style={styles.messageContainer}>
        <Text>{I18n.t('zimbra-message-deleted-confirm-text')}</Text>
      </View>
      <View style={styles.actionsButtonsContainer}>
        <ModalContentBlock style={styles.row}>
          <DialogButtonCancel onPress={closeModal} />
          <DialogButtonOk label={I18n.t('delete')} onPress={() => actionsDeleteSuccess(deleteModal.mailsIds)} />
        </ModalContentBlock>
      </View>
    </ModalContent>
  </ModalBox>
);
