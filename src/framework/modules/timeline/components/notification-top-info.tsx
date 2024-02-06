/**
 * Information about a timeline notification. Displayed in the header.
 */
import * as React from 'react';
import { connect } from 'react-redux';

import { I18n } from '~/app/i18n';
import { IGlobalState } from '~/app/store';
import { ContentCardHeader, ContentCardIcon } from '~/framework/components/card';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';
import { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { APPBADGES } from '~/framework/modules/timeline/app-badges';
import appConf from '~/framework/util/appConf';
import {
  INamedResourceNotification,
  ITimelineNotification,
  getAsNamedResourceNotification,
  getAsSenderNotification,
} from '~/framework/util/notifications';
import HtmlContentView from '~/ui/HtmlContentView';

const NotificationTopInfo = ({ notification, session }: { notification: ITimelineNotification; session: AuthLoggedAccount }) => {
  const message = notification && notification.message;
  const type = notification && notification.type;
  const date = notification && notification.date;
  const sender = notification && getAsSenderNotification(notification)?.sender;
  const resource =
    notification && (getAsNamedResourceNotification(notification)?.resource as Partial<INamedResourceNotification['resource']>);
  const degre = appConf.is1d ? '1d' : '2d';

  let formattedMessage = message;
  if (message) {
    const isSenderMe = sender && sender.id === session.user.id;
    if (resource && resource.name) formattedMessage = formattedMessage.replace(resource.name, ` ${resource.name} `);
    if (sender && sender.displayName)
      formattedMessage = formattedMessage.replace(/<br.*?>/, '').replace(sender.displayName, `${sender.displayName} `);
    if (isSenderMe)
      formattedMessage = formattedMessage.replace(
        sender && sender.displayName,
        `${sender.displayName} ${I18n.get('timeline-meindicator')} `,
      );
    if (notification.type === 'USERBOOK_MOTTO')
      formattedMessage = `<a>${notification.backupData.params.username}</a> ${I18n.get('timeline-notiftype-motto')}`;
    if (notification.type === 'USERBOOK_MOOD')
      formattedMessage = `<a>${notification.backupData.params.username}</a> ${I18n.get(
        `timeline-notiftype-mood-${notification.backupData.params.moodImg}-${degre}`,
      )}`;
  }

  const badgeInfo = {
    icon: APPBADGES[type] && APPBADGES[type].icon,
    color: APPBADGES[type] && APPBADGES[type].color,
  };

  return (
    <ContentCardHeader
      icon={<ContentCardIcon userIds={[sender || require('ASSETS/images/school-avatar.png')]} badge={badgeInfo} />}
      date={date}
      text={
        <HtmlContentView
          html={formattedMessage}
          opts={{
            hyperlinks: false,
            textFormatting: false,
            textColor: false,
            audio: false,
            video: false,
            iframes: false,
            images: false,
            ignoreLineBreaks: true,
            globalTextStyle: {
              ...TextFontStyle.Regular,
              ...TextSizeStyle.Normal,
            },
            linkTextStyle: {
              ...TextFontStyle.Bold,
            },
          }}
        />
      }
    />
  );
};

const mapStateToProps = (s: IGlobalState) => {
  const session = getSession();
  if (!session) throw new Error('[NotificationTopInfo] session not provided');
  return {
    session,
  };
};

export default connect(mapStateToProps)(NotificationTopInfo);
