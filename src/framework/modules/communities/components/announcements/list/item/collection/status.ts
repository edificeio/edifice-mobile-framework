import { SubmissionStatus } from '@edifice.io/collect-client-rest-rn';
import { MembershipRole } from '@edifice.io/community-client-rest-rn';

import theme from '~/app/theme';
import { CollectAnnouncementDetails } from '~/framework/modules/communities/service/announcements';

const STATUS_COLORS = {
  done: {
    background: theme.palette.complementary.green.pale,
    content: theme.palette.complementary.green.regular,
    dark: theme.palette.complementary.green.dark,
    light: theme.palette.complementary.green.light,
  },
  pending: {
    background: theme.palette.complementary.orange.pale,
    content: theme.palette.complementary.orange.dark,
    dark: undefined,
    light: theme.palette.complementary.orange.light,
  },
} as const;

export type CollectionStatusColors = (typeof STATUS_COLORS)[keyof typeof STATUS_COLORS];

export const getCollectionStatus = (announcement: CollectAnnouncementDetails<number>, userRole?: MembershipRole) => {
  const adminCollection = userRole === MembershipRole.ADMIN ? announcement.collection : undefined;
  const isCompleted = adminCollection
    ? adminCollection.contribCount > 0 && adminCollection.submissionCount >= adminCollection.contribCount
    : announcement.submission?.status === SubmissionStatus.SUBMITTED ||
      announcement.submission?.status === SubmissionStatus.VERIFIED;

  return { adminCollection, colors: isCompleted ? STATUS_COLORS.done : STATUS_COLORS.pending, isCompleted };
};
