import { InvitationStatus } from '@edifice.io/community-client-rest-rn';

import { AnyNavigableModuleConfig } from '~/framework/util/moduleTool';

export interface CommunityCardSmallProps {
  hasNewContent?: boolean;
  image?: string | undefined;
  invitationStatus: InvitationStatus;
  membersCount?: number;
  moduleConfig: AnyNavigableModuleConfig;
  onPress: () => void;
  title: string | undefined;
}
