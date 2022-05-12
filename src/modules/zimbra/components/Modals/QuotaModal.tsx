import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { CommonStyles } from '~/styles/common/styles';
import { DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';
import { Text, TextBold } from '~/ui/Typography';
import { Icon } from '~/ui/icons/Icon';

const styles = StyleSheet.create({
  titleContainer: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
  },
  messageContainer: {
    width: '100%',
    marginBottom: 35,
    paddingHorizontal: 18,
  },
  actionsButtonsContainer: {
    alignSelf: 'flex-end',
  },
});

export const ModalStorageWarning = ({ isVisible, closeModal }: { isVisible: boolean; closeModal: () => void }) => (
  <ModalBox isVisible={isVisible} backdropOpacity={0.5}>
    <ModalContent style={{ width: useWindowDimensions().width - 60 }}>
      <View style={styles.titleContainer}>
        <ModalContentBlock style={styles.row}>
          <Icon size={18} name="warning" color={CommonStyles.secondary} />
          <TextBold style={styles.text}>&emsp;{I18n.t('zimbra-quota-overflowTitle')}</TextBold>
        </ModalContentBlock>
      </View>

      <View style={styles.messageContainer}>
        <Text>{I18n.t('zimbra-quota-overflowText')}</Text>
      </View>

      <View style={styles.actionsButtonsContainer}>
        <ModalContentBlock style={styles.row}>
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
