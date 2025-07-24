import { StyleSheet, ViewStyle } from 'react-native';

import { InvitationStatus } from '@edifice.io/community-client-rest-rn';

import { SMALL_CARD_METRICS } from '.';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

const CARD_CONTAINER_STYLE: ViewStyle = {
  alignSelf: 'stretch',
  borderRadius: UI_SIZES.radius.mediumPlus,
  flexDirection: 'column',
  marginHorizontal: UI_SIZES.spacing.big,
  overflow: 'hidden',
  position: 'relative',
};

export const getCardStyle = (invitationStatus: InvitationStatus) => {
  switch (invitationStatus) {
    case InvitationStatus.PENDING:
      return styles.cardPending;
    case InvitationStatus.ACCEPTED:
    case InvitationStatus.REQUEST_ACCEPTED:
      return styles.cardAccepted;
    default:
      return styles.cardAccepted;
  }
};

export const styles = StyleSheet.create({
  cardAccepted: {
    ...CARD_CONTAINER_STYLE,
    borderColor: theme.palette.grey.cloudy,
    borderWidth: UI_SIZES.border.thin,
  },
  cardPending: {
    ...CARD_CONTAINER_STYLE,
    borderColor: theme.palette.status.failure.light,
    borderWidth: SMALL_CARD_METRICS.maxBorderWidth,
  },
  imgContainer: {
    // give a border radius to override the one from ModuleImage
    borderRadius: 0,
    height: SMALL_CARD_METRICS.imgHeight,
  },
  titleContainer: {
    backgroundColor: theme.palette.grey.white,
    padding: SMALL_CARD_METRICS.titlePadding,
  },
});
