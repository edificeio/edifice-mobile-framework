import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { BodyBoldText, SmallText } from '~/framework/components/text';
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
    marginLeft: UI_SIZES.spacing.minor,
  },
  messageContainer: {
    width: '100%',
    marginBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.medium,
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
          <BodyBoldText style={styles.text}>{I18n.t('zimbra-quota-overflowTitle')}</BodyBoldText>
        </ModalContentBlock>
      </View>
      <View style={styles.messageContainer}>
        <SmallText>{I18n.t('zimbra-quota-overflowText')}</SmallText>
      </View>
      <View style={styles.actionsButtonsContainer}>
        <ModalContentBlock style={styles.row}>
          <DialogButtonOk label={I18n.t('common.ok')} onPress={closeModal} />
        </ModalContentBlock>
      </View>
    </ModalContent>
  </ModalBox>
);
