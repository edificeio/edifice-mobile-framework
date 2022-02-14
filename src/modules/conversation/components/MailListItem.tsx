import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { View, StyleSheet, ColorValue } from 'react-native';
import Swipeable from 'react-native-swipeable';
import { NavigationDrawerProp } from 'react-navigation-drawer';

import theme from '~/app/theme';
import { ListItem } from '~/framework/components/listItem';
import { Text, TextBold, TextSemiBold, TextColorStyle, TextSizeStyle } from '~/framework/components/text';
import { displayPastDate } from '~/framework/util/date';
import { IMail } from '~/modules/conversation/state/mailContent';
import { getMailPeople } from '~/modules/conversation/utils/mailInfos';
import { Icon } from '~/ui';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { GridAvatars } from '~/ui/avatars/GridAvatars';

type MailListItemProps = {
  navigation: NavigationDrawerProp<any>;
  mailInfos: IMail;
  renderMailContent: () => any;
  deleteMail: () => any;
  toggleRead: () => any;
  restoreMail: () => any;
  onSwipeStart: (ref: React.Ref<Swipeable>, mailId: string) => any;
  onSwipeRelease: (ref: React.Ref<Swipeable>) => any;
  onSwipeTriggerOpen: (ref: React.Ref<Swipeable>) => any;
  onSwipeRecenter: (mailId: string) => any;
};

export default class MailListItem extends React.PureComponent<MailListItemProps> {
  swipeableRef: InstanceType<Swipeable> | null = null;

  shouldComponentUpdate(nextProps) {
    const { isFetching } = this.props;
    if (!nextProps.isFetching && isFetching) return true;
    return false;
  }

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
        leftButtonProperties.leftActionColor = theme.color.success;
        leftButtonProperties.leftActionText = I18n.t('conversation.restore');
        leftButtonProperties.leftActionIcon = 'unarchive';
        leftButtonProperties.leftAction = restoreMail;
        break;
      default:
        leftButtonProperties.leftActionColor = theme.color.secondary.regular;
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
        <Icon name={actionIcon} size={16} color={theme.color.text.inverse} />
        <Text style={{ color: theme.color.text.inverse, marginLeft: 10 }}>{actionText}</Text>
      </View>
    </TouchableOpacity>,
  ];

  render() {
    const {
      navigation,
      mailInfos,
      renderMailContent,
      deleteMail,
      onSwipeTriggerOpen,
      onSwipeRecenter,
      onSwipeStart,
      onSwipeRelease,
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
      <Swipeable
        onRef={ref => (this.swipeableRef = ref)}
        leftButtonWidth={140}
        rightButtonWidth={140}
        onSwipeStart={() => onSwipeStart(this.swipeableRef, mailId)}
        onSwipeRelease={() => onSwipeRelease(this.swipeableRef)}
        onLeftButtonsActivate={() => onSwipeTriggerOpen(this.swipeableRef)}
        onRightButtonsActivate={() => onSwipeTriggerOpen(this.swipeableRef)}
        onLeftButtonsDeactivate={() => onSwipeRecenter(mailId)}
        onRightButtonsDeactivate={() => onSwipeRecenter(mailId)}
        leftButtons={
          isFolderOutbox || isFolderDrafts
            ? undefined
            : this.swipeButtons(
                { backgroundColor: leftActionColor, justifyContent: 'flex-end' },
                () => {
                  this.swipeableRef?.recenter(); // ToDo
                  onSwipeRecenter(mailId);
                  leftAction();
                },
                leftActionIcon,
                leftActionText,
              )
        }
        rightButtons={this.swipeButtons(
          { backgroundColor: theme.color.failure },
          () => {
            this.swipeableRef?.recenter(); // ToDo
            onSwipeRecenter(mailId);
            deleteMail();
          },
          'trash',
          I18n.t('conversation.delete'),
        )}>
        <TouchableOpacity onPress={() => renderMailContent()}>
          <ListItem
            style={isMailUnread ? styles.containerMailUnread : styles.containerMailRead}
            leftElement={<GridAvatars users={contacts.map(c => c[0]!)} />}
            rightElement={
              <View style={styles.mailInfos}>
                {/* Contact name */}
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  {(() => {
                    const TextContactComponent = isMailUnread ? TextBold : TextSemiBold;
                    const textContactPrefixColor = isMailUnread ? theme.color.text.regular : theme.color.text.light;
                    return (
                      <>
                        {isFolderOutbox || isFolderDrafts ? (
                          <Text style={{ color: textContactPrefixColor }}>{I18n.t('conversation.toPrefix') + ' '}</Text>
                        ) : null}
                        <TextContactComponent
                          numberOfLines={1}
                          style={{ ...(isFolderDrafts ? TextColorStyle.Warning : {}), flex: 1 }}>
                          {contacts.map(c => c[1]).join(', ')}
                        </TextContactComponent>
                      </>
                    );
                  })()}
                  {/* Date */}
                  <Text style={styles.mailDate} numberOfLines={1}>
                    {displayPastDate(moment(mailInfos.date))}
                  </Text>
                </View>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  {/* Mail subjet & content */}
                  <View style={{ flex: 1 }}>
                    {(() => {
                      const TextSubjectComponent = isMailUnread ? TextSemiBold : Text;
                      const textSubjectColor = isMailUnread ? theme.color.text.heavy : theme.color.text.regular;
                      return (
                        <TextSubjectComponent
                          numberOfLines={1}
                          style={{ marginTop: 4, flex: 1, color: textSubjectColor, ...TextSizeStyle.Small }}>
                          {mailInfos.subject}
                        </TextSubjectComponent>
                      );
                    })()}
                  </View>
                  {/* Mail attachment indicator */}
                  {mailInfos.hasAttachment && (
                    <View style={styles.mailIndicator}>
                      <Icon name="attachment" size={16} color={theme.color.text.light} />
                    </View>
                  )}
                </View>
              </View>
            }
          />
        </TouchableOpacity>
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  containerMailRead: {
    paddingVertical: 18,
  },
  containerMailUnread: {
    backgroundColor: theme.color.secondary.extraLight,
    paddingVertical: 18,
  },
  mailInfos: {
    paddingLeft: 12,
    flex: 1,
  },
  mailDate: {
    textAlign: 'right',
    alignItems: 'center',
    justifyContent: 'flex-end',
    ...TextColorStyle.Light,
  },
  mailIndicator: {
    flexDirection: 'row',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 2,
    paddingLeft: 12,
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
    paddingHorizontal: 20,
  },
});
