import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import theme from '~/app/theme';
import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold, TextSizeStyle } from '~/framework/components/text';
import { DialogButtonOk } from '~/ui/ConfirmDialog';
import { ModalBox, ModalContent, ModalContentBlock } from '~/ui/Modal';

const styles = StyleSheet.create({
  titleContainer: {
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    ...TextSizeStyle.SlightBig,
    marginLeft: 8, // MO-142 use UI_SIZES.spacing here
  },
  messageContainer: {
    width: '100%',
    marginBottom: 35, // MO-142 use UI_SIZES.spacing here
    paddingHorizontal: 18, // MO-142 use UI_SIZES.spacing here
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
          <Icon size={18} name="warning" color={theme.palette.secondary.regular} />
          <TextBold style={styles.text}>{I18n.t('zimbra-quota-overflowTitle')}</TextBold>
        </ModalContentBlock>
      </View>
      <View style={styles.messageContainer}>
        <Text>{I18n.t('zimbra-quota-overflowText')}</Text>
      </View>
      <View style={styles.actionsButtonsContainer}>
        <ModalContentBlock style={styles.row}>
          <DialogButtonOk label={I18n.t('common.ok')} onPress={closeModal} />
        </ModalContentBlock>
      </View>
    </ModalContent>
  </ModalBox>
);
