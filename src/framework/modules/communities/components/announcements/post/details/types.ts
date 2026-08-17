import { ViewProps } from 'react-native';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { AnnouncementDetails } from '~/framework/modules/communities/service/announcements';

interface PostDetailsDisplayProps {
  header?: React.ReactElement;
  session: AuthActiveAccount;
  style?: ViewProps['style'];
}

export type PostDetailsProps<IdType extends string | number> = AnnouncementDetails<IdType> & PostDetailsDisplayProps;
