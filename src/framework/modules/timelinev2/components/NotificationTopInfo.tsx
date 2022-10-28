/**
 * Information about a timeline notification. Displayed in the header.
 */
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { ContentCardHeader, ContentCardIcon } from '~/framework/components/card';
import { TextFontStyle, TextSizeStyle } from '~/framework/components/text';
import { APPBADGES } from '~/framework/modules/timelinev2/appBadges';
import { ITimelineNotification } from '~/framework/util/notifications';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { HtmlContentView } from '~/ui/HtmlContentView';

const NotificationTopInfo = ({ notification, session }: { notification: ITimelineNotification; session: IUserSession }) => {
  const message = notification && notification.message;
  const type = notification && notification.type;
  const date = notification && notification.date;
  const sender = notification && notification.sender; // ToDo fix types here
  const resource = notification && notification.resource;

  let formattedMessage = message;
  if (message) {
    const isSenderMe = sender && sender.id === session.user.id;
    if (resource && resource.name) formattedMessage = formattedMessage.replace(resource.name, ` ${resource.name} `);
    if (sender && sender.displayName)
      formattedMessage = formattedMessage.replace(/<br.*?>/, '').replace(sender.displayName, `${sender.displayName} `);
    if (isSenderMe)
      formattedMessage = formattedMessage.replace(sender && sender.displayName, `${sender.displayName} ${I18n.t('me-indicator')} `);
  }

  const badgeInfo = {
    icon: APPBADGES[type] && APPBADGES[type].icon,
    color: APPBADGES[type] && APPBADGES[type].color,
  };
  return (
    <ContentCardHeader
      icon={<ContentCardIcon userIds={[sender || require('ASSETS/images/system-avatar.png')]} badge={badgeInfo} />}
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
              ...TextSizeStyle.Small,
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

const mapStateToProps: (s: IGlobalState) => { session: IUserSession } = s => {
  return {
    session: getUserSession(),
  };
};

export default connect(mapStateToProps)(NotificationTopInfo);
