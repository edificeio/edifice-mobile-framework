import * as React from 'react';
import { View } from 'react-native';

import { ModalWrapper } from '../modal-wrapper';
import styles from './styles';
import { InactiveUserModalProps } from './types';

import { I18n } from '~/app/i18n';
import IconButton from '~/framework/components/buttons/icon';
import FlatList from '~/framework/components/list/flat-list';
import { BodyBoldText, BodyText, HeadingSText } from '~/framework/components/text';

export const InactiveUserModalContentContainer: React.FC<InactiveUserModalProps> = ({ action, inactiveUsers, isVisible }) => {
  return (
    <ModalWrapper isVisible={isVisible} onClose={action} animationType="fade">
      <View style={styles.modalCloseButtonWrapper}>
        <IconButton icon="ui-close" action={action} />
      </View>
      <View style={styles.modalWrapperContentContainer}>
        <View style={styles.modalHeaderContainer}>
          <HeadingSText style={styles.modalHeaderTitle}>{I18n.get('mails-edit-inactiveusermodaltitle')}</HeadingSText>
        </View>

        <BodyText style={styles.modalWrapperMessageContainer}>{I18n.get('mails-edit-inactiveusermodalmessage')}</BodyText>

        <BodyBoldText>{I18n.get('mails-edit-inactiveusermodallisttitle')}</BodyBoldText>

        <View style={styles.scrollContainer}>
          <FlatList
            data={inactiveUsers}
            keyExtractor={(_, index) => `${index}`}
            renderItem={({ item }) => <BodyText>{item}</BodyText>}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
            showsVerticalScrollIndicator
          />
        </View>
      </View>
    </ModalWrapper>
  );
};
