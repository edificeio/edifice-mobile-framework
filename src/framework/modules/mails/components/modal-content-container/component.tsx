import * as React from 'react';
import { View } from 'react-native';

import { ModalWrapper } from '../modal-wrapper';
import styles from './styles';
import { InactiveUserModalProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import ScrollView from '~/framework/components/scrollView';
import { BodyBoldText, BodyText, HeadingSText } from '~/framework/components/text';

export const InactiveUserModalContentContainer: React.FC<InactiveUserModalProps> = ({ action, inactiveUsers, isVisible }) => {
  return (
    <ModalWrapper isVisible={isVisible} onClose={action} animationType="fade">
      <View style={styles.modalWrapperContentContainer}>
        <View style={styles.modalHeaderContainer}>
          <Svg
            name="ui-alert-triangle"
            width={UI_SIZES.spacing.large}
            height={UI_SIZES.spacing.large}
            fill={theme.palette.status.warning.regular}
            style={styles.modalHeaderIconStyle}
          />
          <HeadingSText style={styles.modalHeaderTitle}>{I18n.get('mails-edit-inactiveusermodaltitle')}</HeadingSText>
        </View>
        <BodyText style={styles.modalWrapperMessageContainer}>{I18n.get('mails-edit-inactiveusermodalmessage')}</BodyText>

        <BodyBoldText>{I18n.get('mails-edit-inactiveusermodallisttitle')}</BodyBoldText>

        <View style={styles.scrollContainer}>
          <ScrollView>
            {inactiveUsers.map((user, index) => (
              <BodyText key={`inactive#${index}`}>{user}</BodyText>
            ))}
          </ScrollView>
        </View>
        <View style={styles.modalCloseButtonWrapper}>
          <PrimaryButton text={I18n.get('timeline-close')} action={action} testID="close-inactive-User-modal" />
        </View>
      </View>
    </ModalWrapper>
  );
};
