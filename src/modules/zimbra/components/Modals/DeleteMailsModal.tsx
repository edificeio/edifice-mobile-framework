import I18n from 'i18n-js';
import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';



import { CommonStyles } from '~/styles/common/styles';
import { DialogButtonCancel, DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';
import { Text, TextBold } from '~/ui/Typography';
import { Icon } from '~/ui/icons/Icon';


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
      <View style={{ alignSelf: 'flex-start' }}>
        <ModalContentBlock style={{ flexDirection: 'row' }}>
          <Icon size={18} name="warning" color={CommonStyles.secondary} />
          <TextBold style={{ fontSize: 16 }}>&emsp;{I18n.t('zimbra-message-deleted-confirm')}</TextBold>
        </ModalContentBlock>
      </View>

      <View style={{ width: '100%', marginBottom: 35, paddingHorizontal: 20 }}>
        <Text>{I18n.t('zimbra-message-deleted-confirm-text')}</Text>
      </View>

      <View style={{ alignSelf: 'flex-end' }}>
        <ModalContentBlock style={{ flexDirection: 'row' }}>
          <DialogButtonCancel onPress={() => closeModal()} />
          <DialogButtonOk
            style={{ backgroundColor: CommonStyles.secondary }}
            label={I18n.t('delete')}
            onPress={() => actionsDeleteSuccess(deleteModal.mailsIds)}
          />
        </ModalContentBlock>
      </View>
    </ModalContent>
  </ModalBox>
);