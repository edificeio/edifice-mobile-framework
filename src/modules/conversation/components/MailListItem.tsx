import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { ColorValue, StyleSheet, View } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

// import Swipeable from 'react-native-swipeable';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { ListItem } from '~/framework/components/listItem';
import { Icon } from '~/framework/components/picture/Icon';
import { CaptionBoldText, CaptionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { displayPastDate } from '~/framework/util/date';
import { IMail } from '~/modules/conversation/state/mailContent';
import { getMailPeople } from '~/modules/conversation/utils/mailInfos';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { GridAvatars } from '~/ui/avatars/GridAvatars';

type MailListItemProps = {
  navigation: NavigationScreenProp<any>;
  mailInfos: IMail;
  renderMailContent: () => any;
  deleteMail: () => any;
  toggleRead: () => any;
  restoreMail: () => any;
  // onSwipeStart: (ref: React.Ref<Swipeable>, mailId: string) => any;
  // onSwipeRelease: (ref: React.Ref<Swipeable>) => any;
  // onSwipeTriggerOpen: (ref: React.Ref<Swipeable>) => any;
  // onSwipeRecenter: (mailId: string) => any;
};

export default class MailListItem extends React.PureComponent<MailListItemProps> {
  // swipeableRef: InstanceType<Swipeable> | null = null;

  getLeftButtonProperties(currentFolder: string, unread: boolean) {
    const { toggleRead, restoreMail } = this.props;
    const leftButtonProperties = {
      leftActionColor: '' as ColorValue,
      leftActionText: '',
      leftActionIcon: '',
      leftAction: () => null,
    };
    switch (currentFolder) {
      case 'trash':
        leftButtonProperties.leftActionColor = theme.palette.status.success.regular;
        leftButtonProperties.leftActionText = I18n.t('conversation.restore');
        leftButtonProperties.leftActionIcon = 'unarchive';
        leftButtonProperties.leftAction = restoreMail;
        break;
      default:
        leftButtonProperties.leftActionColor = theme.palette.status.info.regular;
        leftButtonProperties.leftActionText = I18n.t(`conversation.mark${unread ? 'Read' : 'Unread'}`);
        leftButtonProperties.leftActionIcon = `eye${unread ? '' : '-slash'}`;
        leftButtonProperties.leftAction = toggleRead;
        break;
    }
    return leftButtonProperties;
  }

  swipeButtons = (style, action, actionIcon, actionText) => [
    <TouchableOpacity style={[styles.buttonContainer, style]} onPress={action}>
      <View style={styles.button}>
        <Icon name={actionIcon} size={16} color={theme.ui.text.inverse} />
        <SmallText style={{ color: theme.ui.text.inverse, marginLeft: UI_SIZES.spacing.small }}>{actionText}</SmallText>
      </View>
    </TouchableOpacity>,
  ];

  render() {
    const {
      navigation,
      mailInfos,
      renderMailContent,
      deleteMail,
      // onSwipeTriggerOpen,
      // onSwipeRecenter,
      // onSwipeStart,
      // onSwipeRelease,
    } = this.props;
    const navigationKey = navigation.getParam('key');
    const isFolderOutbox = navigationKey === 'sendMessages';
    const isFolderDrafts = navigationKey === 'drafts';
    const mailId = mailInfos.id;
    const isMailUnread = mailInfos.unread && !isFolderDrafts && !isFolderOutbox;
    const mailContacts = getMailPeople(mailInfos);
    const { leftActionColor, leftActionText, leftActionIcon, leftAction } = this.getLeftButtonProperties(
      navigationKey,
      isMailUnread,
    );
    let contacts = !isFolderOutbox && !isFolderDrafts ? [mailContacts.from] : mailContacts.to;
    if (contacts.length === 0) contacts = [[undefined, I18n.t('conversation.emptyTo'), false]];

    return (
      // <View
      // onRef={ref => (this.swipeableRef = ref)}
      // leftButtonWidth={140}
      // rightButtonWidth={140}
      // onSwipeStart={() => onSwipeStart(this.swipeableRef, mailId)}
      // onSwipeRelease={() => onSwipeRelease(this.swipeableRef)}
      // onLeftButtonsActivate={() => onSwipeTriggerOpen(this.swipeableRef)}
      // onRightButtonsActivate={() => onSwipeTriggerOpen(this.swipeableRef)}
      // onLeftButtonsDeactivate={() => onSwipeRecenter(mailId)}
      // onRightButtonsDeactivate={() => onSwipeRecenter(mailId)}
      // leftButtons={
      //   isFolderOutbox || isFolderDrafts
      //     ? undefined
      //     : this.swipeButtons(
      //         { backgroundColor: leftActionColor, justifyContent: 'flex-end' },
      //         () => {
      //           this.swipeableRef?.recenter(); // ToDo
      //           onSwipeRecenter(mailId);
      //           leftAction();
      //         },
      //         leftActionIcon,
      //         leftActionText,
      //       )
      // }
      // rightButtons={this.swipeButtons(
      //   { backgroundColor: theme.palette.status.failure.regular },
      //   () => {
      //     this.swipeableRef?.recenter(); // ToDo
      //     onSwipeRecenter(mailId);
      //     deleteMail();
      //   },
      //   'trash',
      //   I18n.t('conversation.delete'),
      // )}>
      <TouchableOpacity onPress={() => renderMailContent()}>
        <ListItem
          style={isMailUnread ? styles.containerMailUnread : styles.containerMailRead}
          leftElement={<GridAvatars users={contacts.map(c => c[0]!)} />}
          rightElement={
            <View style={styles.mailInfos}>
              {/* Contact name */}
              <View style={{ flex: 1, flexDirection: 'row' }}>
                {(() => {
                  const TextContactComponent = isMailUnread ? SmallBoldText : SmallBoldText;
                  const textContactPrefixColor = isMailUnread ? theme.ui.text.regular : theme.ui.text.light;
                  return (
                    <>
                      {isFolderOutbox || isFolderDrafts ? (
                        <SmallText style={{ color: textContactPrefixColor }}>{I18n.t('conversation.toPrefix') + ' '}</SmallText>
                      ) : null}
                      <TextContactComponent
                        numberOfLines={1}
                        style={{ ...(isFolderDrafts ? { color: theme.palette.status.warning.regular } : {}), flex: 1 }}>
                        {contacts.map(c => c[1]).join(', ')}
                      </TextContactComponent>
                    </>
                  );
                })()}
                {/* Date */}
                <SmallText style={styles.mailDate} numberOfLines={1}>
                  {displayPastDate(moment(mailInfos.date))}
                </SmallText>
              </View>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                {/* Mail subjet & content */}
                <View style={{ flex: 1 }}>
                  {(() => {
                    const TextSubjectComponent = isMailUnread ? CaptionBoldText : CaptionText;
                    return (
                      <TextSubjectComponent numberOfLines={1} style={{ marginTop: UI_SIZES.spacing.tiny, flex: 1 }}>
                        {mailInfos.subject}
                      </TextSubjectComponent>
                    );
                  })()}
                </View>
                {/* Mail attachment indicator */}
                {mailInfos.hasAttachment && (
                  <View style={styles.mailIndicator}>
                    <Icon name="attachment" size={16} color={theme.ui.text.light} />
                  </View>
                )}
              </View>
            </View>
          }
        />
      </TouchableOpacity>
      // </View>
    );
  }
}

const styles = StyleSheet.create({
  containerMailRead: {
    paddingVertical: UI_SIZES.spacing.medium,
  },
  containerMailUnread: {
    backgroundColor: theme.palette.primary.pale,
    paddingVertical: UI_SIZES.spacing.medium,
  },
  mailInfos: {
    paddingLeft: UI_SIZES.spacing.small,
    flex: 1,
  },
  mailDate: {
    textAlign: 'right',
    alignItems: 'center',
    justifyContent: 'flex-end',
    color: theme.ui.text.light,
  },
  mailIndicator: {
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: UI_SIZES.spacing.tiny,
    paddingLeft: UI_SIZES.spacing.small,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    paddingHorizontal: UI_SIZES.spacing.big,
  },
});
