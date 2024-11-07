import * as React from 'react';
import { View } from 'react-native';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import moment from 'moment';

import styles from './styles';
import type { MailsDetailsScreenPrivateProps } from './types';

import { I18n } from '~/app/i18n';
import Attachments from '~/framework/components/attachments';
import SecondaryButton from '~/framework/components/buttons/secondary';
import { UI_SIZES } from '~/framework/components/constants';
import { RichEditorViewer } from '~/framework/components/inputs/rich-text';
import { NavBarAction, NavBarActionsGroup } from '~/framework/components/navigation';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import Separator from '~/framework/components/separator';
import { HeadingXSText, SmallBoldText, SmallItalicText, SmallText } from '~/framework/components/text';
import { mailsDetailsData } from '~/framework/modules/mails/data';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { displayPastDate } from '~/framework/util/date';
import Avatar, { Size } from '~/ui/avatars/Avatar';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MailsNavigationParams, typeof mailsRouteNames.details>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
});

enum RecipientsType {
  TO = 'to',
  CC = 'cc',
  CCI = 'cci',
}

const recipientPrefixsI18n = {
  [RecipientsType.TO]: 'mails-details-to',
  [RecipientsType.CC]: 'mails-details-cc',
  [RecipientsType.CCI]: 'mails-details-cci',
};

export default function MailsDetailsScreen(props: MailsDetailsScreenPrivateProps) {
  React.useEffect(() => {
    props.navigation.setOptions({
      headerRight: () => <NavBarActionsGroup elements={[<NavBarAction icon="ui-undo" />, <NavBarAction icon="ui-options" />]} />,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderRecipients = () => {
    return Object.keys(RecipientsType).map(recipientTypeKey => {
      const recipientType = RecipientsType[recipientTypeKey];
      if (mailsDetailsData[recipientType].length === 0) return;
      return (
        <View style={styles.recipientsItem}>
          <SmallText>{I18n.get(recipientPrefixsI18n[recipientType])}</SmallText>
          <SmallText style={styles.recipientsText}>
            {mailsDetailsData[recipientType].map(recipient => recipient.displayName).join(', ')}
          </SmallText>
        </View>
      );
    });
  };

  return (
    <PageView>
      <ScrollView style={styles.page}>
        <HeadingXSText>{mailsDetailsData.subject}</HeadingXSText>
        <View style={styles.topInfos}>
          <Avatar size={Size.large} sourceOrId={mailsDetailsData.from.id} id="" />
          <View style={styles.topInfosText}>
            <View style={styles.sender}>
              <SmallBoldText style={styles.senderName}>{mailsDetailsData.from.displayName}</SmallBoldText>
              <SmallItalicText>{displayPastDate(moment(mailsDetailsData.date))}</SmallItalicText>
            </View>
            {renderRecipients()}
          </View>
        </View>
        <RichEditorViewer content={mailsDetailsData.body} />
        <Attachments
          attachments={[
            { name: 'cc.png', uri: '' },
            { name: 'dbzhdbezhdbezddferfderfrefrezd.png', uri: '' },
            { name: 'a', uri: '' },
            { name: 'b', uri: '' },
            { name: 'c', uri: '' },
            { name: 'a', uri: '' },
            { name: 'b', uri: '' },
            { name: 'c', uri: '' },
          ]}
        />
        <Separator marginVertical={UI_SIZES.spacing.big} />
        <View style={styles.buttons}>
          <SecondaryButton iconLeft="ui-undo" text={I18n.get('mails-details-forward')} action={() => console.log('transférer')} />
          <SecondaryButton iconLeft="ui-redo" text={I18n.get('mails-details-reply')} action={() => console.log('répondre')} />
        </View>
      </ScrollView>
    </PageView>
  );
}
