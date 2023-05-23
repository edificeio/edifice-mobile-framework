import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { ListItem } from '~/framework/components/listItem';
import { Picture } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { IMail } from '~/framework/modules/zimbra/model';
import { displayPastDate } from '~/framework/util/date';
import { GridAvatars } from '~/ui/avatars/GridAvatars';

const styles = StyleSheet.create({
  contactContainer: {
    flexDirection: 'row',
    flexShrink: 1,
    alignItems: 'center',
  },
  contactText: {
    flexShrink: 1,
    marginRight: UI_SIZES.spacing.tiny,
  },
  container: {
    borderBottomWidth: 0,
  },
  dateText: {
    color: theme.ui.text.light,
  },
  lineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  rightContainer: {
    flex: 1,
    marginLeft: UI_SIZES.spacing.small,
  },
  selectedContainer: {
    borderBottomWidth: 0,
    backgroundColor: theme.palette.primary.pale,
    borderRadius: UI_SIZES.radius.medium,
    margin: UI_SIZES.spacing.tiny,
    padding: UI_SIZES.spacing.minor,
  },
  subjectText: {
    flexShrink: 1,
    color: theme.ui.text.light,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    marginRight: UI_SIZES.spacing.tiny,
    backgroundColor: theme.palette.secondary.regular,
    borderRadius: 5,
  },
});

interface IMailListItemProps {
  isSelected: boolean;
  mail: Omit<IMail, 'body'>;
  onPress: (mail: Omit<IMail, 'body'>) => void;
  selectMail: (mail: Omit<IMail, 'body'>) => void;
}

export class MailListItem extends React.PureComponent<IMailListItemProps> {
  getContactName = (id: string) => {
    const { mail } = this.props;

    const displayName = mail.displayNames.find(item => item[0] === id);
    return displayName?.[1] ?? I18n.get('zimbra-unknown');
  };

  public render() {
    const { isSelected, mail, onPress, selectMail } = this.props;
    const contactIds = mail.systemFolder !== 'OUTBOX' && mail.systemFolder !== 'DRAFTS' ? [mail.from] : mail.to;
    const contactName = this.getContactName(contactIds[0]);
    const ContactText = mail.unread ? SmallBoldText : SmallText;
    const SubjectText = mail.unread ? SmallBoldText : SmallText;

    return (
      <TouchableOpacity onPress={() => onPress(mail)} onLongPress={() => selectMail(mail)}>
        <ListItem
          leftElement={<GridAvatars users={contactIds} />}
          rightElement={
            <View style={styles.rightContainer}>
              <View style={styles.lineContainer}>
                <View style={styles.contactContainer}>
                  {mail.unread ? <View style={styles.unreadIndicator} /> : null}
                  <ContactText numberOfLines={1} style={styles.contactText}>
                    {contactName}
                  </ContactText>
                </View>
                <SmallText numberOfLines={1} style={styles.dateText}>
                  {displayPastDate(mail.date)}
                </SmallText>
              </View>
              <View style={styles.lineContainer}>
                <SubjectText numberOfLines={1} style={styles.subjectText}>
                  {mail.subject}
                </SubjectText>
                {mail.hasAttachment ? (
                  <Picture type="NamedSvg" name="ui-attachment" width={18} height={18} fill={theme.ui.text.light} />
                ) : null}
              </View>
            </View>
          }
          style={isSelected ? styles.selectedContainer : styles.container}
        />
      </TouchableOpacity>
    );
  }
}
