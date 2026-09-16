import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { MembershipRole } from '@edifice.io/community-client-rest-rn';
import { Temporal } from '@js-temporal/polyfill';

import { I18n } from '~/app/i18n';
import { UI_STYLES } from '~/framework/components/constants';
import { BodyText, SmallText } from '~/framework/components/text';
import { getCollectionStatus } from '~/framework/modules/communities/components/announcements/list/item/collection/status';
import styles from '~/framework/modules/communities/components/announcements/list/item/collection/styles';
import { CollectionItemProps } from '~/framework/modules/communities/components/announcements/list/item/collection/types';
import { CollectAnnouncementDetails } from '~/framework/modules/communities/service/announcements';
import { openUrl } from '~/framework/util/linking';

import DeadlineBadge from './deadline-badge';
import StatusPill from './status-pill';

const COLLECTION_URL_BASE = 'collect/list-collections/id';

const getCollectionUrl = (announcement: CollectAnnouncementDetails<number>, platformUrl: string, userRole?: MembershipRole) => {
  const { collectId, submission } = announcement;
  const collectionUrl = `${platformUrl}/${COLLECTION_URL_BASE}/${collectId}`;

  return userRole !== MembershipRole.ADMIN && submission ? `${collectionUrl}/submission/${submission.submissionId}` : collectionUrl;
};

const CollectionItem = ({ announcement, platformUrl, style, userRole }: Readonly<CollectionItemProps>) => {
  const { collection, date, submission } = announcement;
  const name = collection?.name ?? submission?.name;
  const deadline = collection?.deadline ?? submission?.deadline;
  const { adminCollection, colors, isCompleted } = getCollectionStatus(announcement, userRole);

  const redirectToWeb = React.useCallback(
    () => openUrl(getCollectionUrl(announcement, platformUrl, userRole)),
    [announcement, platformUrl, userRole],
  );

  const displayedDate = React.useMemo(
    () => (date ? I18n.get('communities-collect-distributed', { date: I18n.date(date) }) : ''),
    [date],
  );
  // The API sends ISO strings even though the DTO types them as Date.
  const deadlineInstant = React.useMemo(
    () => (deadline ? Temporal.Instant.from(deadline as unknown as string) : undefined),
    [deadline],
  );
  const displayedDeadline = React.useMemo(() => (deadlineInstant ? I18n.date(deadlineInstant) : ''), [deadlineInstant]);
  if (!name || !deadlineInstant)
    return (
      <View style={style}>
        <SmallText>{I18n.get('communities-collect-unavailable')}</SmallText>
      </View>
    );

  return (
    <TouchableOpacity style={style} onPress={redirectToWeb} testID="communities-collection-touchable">
      <View style={styles.header}>
        <DeadlineBadge colors={colors} deadline={deadlineInstant} isCompleted={isCompleted} />
        <View style={UI_STYLES.flex1}>
          <BodyText numberOfLines={1} testID="communities-collection-title">
            {name}
          </BodyText>
          <SmallText style={styles.distributedDate}>{displayedDate}</SmallText>
        </View>
      </View>
      {adminCollection ? (
        <StatusPill
          colors={colors}
          isCompleted={isCompleted}
          text={`${adminCollection.contribCount} / ${adminCollection.submissionCount}`}
        />
      ) : (
        <StatusPill
          colors={colors}
          icon={'ui-inbox-hand'}
          isCompleted={isCompleted}
          text={
            isCompleted
              ? I18n.get('communities-collect-submitted')
              : I18n.get('communities-collect-deadline', { date: displayedDeadline })
          }
        />
      )}
    </TouchableOpacity>
  );
};

export default CollectionItem;
