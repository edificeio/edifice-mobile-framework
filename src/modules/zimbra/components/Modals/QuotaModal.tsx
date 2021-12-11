import I18n from 'i18n-js';
import * as React from 'react';
import { View, useWindowDimensions } from 'react-native';

import { CommonStyles } from '~/styles/common/styles';
import { Icon } from '~/ui';
import { DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';
import { Text, TextBold } from '~/ui/Typography';

export const ModalStorageWarning = ({ isVisible, closeModal }: { isVisible: boolean; closeModal: () => void }) => (
  <ModalBox isVisible={isVisible} backdropOpacity={0.5}>
    <ModalContent style={{ width: useWindowDimensions().width - 60 }}>
      <View style={{ alignSelf: 'flex-start' }}>
        <ModalContentBlock style={{ flexDirection: 'row' }}>
          <Icon size={18} name="warning" color={CommonStyles.secondary} />
          <TextBold style={{ fontSize: 16 }}>&emsp;{I18n.t('zimbra-quota-overflowTitle')}</TextBold>
        </ModalContentBlock>
      </View>

      <View style={{ width: '100%', marginBottom: 35, paddingHorizontal: 18 }}>
        <Text>{I18n.t('zimbra-quota-overflowText')}</Text>
      </View>

      <View style={{ alignSelf: 'flex-end' }}>
        <ModalContentBlock style={{ flexDirection: 'row' }}>
          <DialogButtonOk
            style={{ backgroundColor: CommonStyles.secondary }}
            label={I18n.t('common.ok')}
            onPress={() => closeModal()}
          />
        </ModalContentBlock>
      </View>
    </ModalContent>
  </ModalBox>
);
