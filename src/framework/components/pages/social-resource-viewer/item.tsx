import * as React from 'react';
import { View } from 'react-native';

import { ListRenderItemInfo } from '@shopify/flash-list';

import { I18n } from '~/app/i18n';
import { SingleAvatar } from '~/framework/components/avatar';
import { BodyBoldText, CaptionItalicText, SmallText } from '~/framework/components/text';
import { AccountTypeText } from '~/framework/modules/auth/components/account-type-text';
import { TemporalTimeText } from '~/framework/util/date';

import styles from './styles';
import { CommentItem, ITEM_COMMENT, ITEM_RESPONSE, ResponseItem, SocialResourceViewerItemType } from './types';

export const SocialResourceViewerCommentItem = ({ item }: ListRenderItemInfo<CommentItem>) => {
  const itemStyle = React.useMemo(() => [styles.itemCommon, styles.itemComment], []);
  const itemTreeStyle = React.useMemo(() => [styles.itemTreeCommon, styles.itemTreeComment], []);

  return (
    <View style={itemStyle}>
      <View style={itemTreeStyle}>
        <SingleAvatar size="xsm" userId={item.authorId} />
        {item.hasResponses && <View style={styles.itemTreeDecoStraight} />}
      </View>
      <View style={styles.itemContentWrapper}>
        <View style={styles.itemUserHeader}>
          <BodyBoldText numberOfLines={1} style={styles.itemAuthor}>
            {item.authorName}
            {I18n.get('common-separator-dash')}
          </BodyBoldText>
          <AccountTypeText type={item.authorAccountType} TextComponent={BodyBoldText} />
          <CaptionItalicText numberOfLines={1} style={styles.itemDate}>
            <TemporalTimeText instant={item.date} timeFormat="time-small" dateFormat="date-small" relative />
          </CaptionItalicText>
        </View>
        <View>
          <SmallText style={styles.itemContentText}>{item.value}</SmallText>
          <View style={styles.itemContentButtons} />
        </View>
      </View>
    </View>
  );
};

export const SocialResourceViewerResponseItem = (info: ListRenderItemInfo<ResponseItem>) => {
  const itemStyle = React.useMemo(() => ({ padding: 16 }), []);
  return <BodyBoldText style={itemStyle}>Réponse {info.item.value.toString()}</BodyBoldText>;
};

export const SocialResourceViewerItem = (info: ListRenderItemInfo<SocialResourceViewerItemType>) => {
  if (info.item.type === ITEM_COMMENT) {
    return <SocialResourceViewerCommentItem {...(info as ListRenderItemInfo<CommentItem>)} />;
  } else if (info.item.type === ITEM_RESPONSE) {
    return <SocialResourceViewerResponseItem {...(info as ListRenderItemInfo<ResponseItem>)} />;
  } else {
    return <BodyBoldText>ITEM INCONNU {info.item.value.toString()}</BodyBoldText>;
  }
};
