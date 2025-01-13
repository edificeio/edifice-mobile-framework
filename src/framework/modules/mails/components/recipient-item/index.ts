import { ViewStyle } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import { MailsRecipientGroupItemProps, MailsRecipientUserItemProps } from './types';

import { MailsRecipientGroupItem } from './group';
import { MailsRecipientUserItem } from './user';

export const containerStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: UI_SIZES.spacing.tiny,
  paddingVertical: UI_SIZES.spacing.minor,
  columnGap: UI_SIZES.spacing.minor,
};

export { MailsRecipientGroupItem, MailsRecipientUserItem };
export type { MailsRecipientGroupItemProps, MailsRecipientUserItemProps };
