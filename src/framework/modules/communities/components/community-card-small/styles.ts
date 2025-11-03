import { PixelRatio, StyleSheet, ViewStyle } from 'react-native';

import { InvitationStatus } from '@edifice.io/community-client-rest-rn';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

const CARD_CONTAINER_STYLE: ViewStyle = {
  alignSelf: 'stretch',
  borderRadius: UI_SIZES.radius.mediumPlus,
  flexDirection: 'column',
  marginHorizontal: UI_SIZES.spacing.big,
  overflow: 'hidden',
  position: 'relative',
};

const IMAGE_HEIGHT = getScaleWidth(80);
const LOADER_HEIGHT =
  TextSizeStyle.Medium.lineHeight * PixelRatio.getFontScale() + IMAGE_HEIGHT + 2 * (UI_SIZES.border.small + UI_SIZES.spacing.small);

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
    borderWidth: UI_SIZES.border.small,
  },
  imgContainer: {
    // give a border radius to override the one from ModuleImage
    borderRadius: 0,
    height: IMAGE_HEIGHT,
  },
  loaderCard: {
    borderRadius: UI_SIZES.radius.mediumPlus,
    height: LOADER_HEIGHT,
    width: '100%',
  },
  loaderCardContainer: {
    marginHorizontal: UI_SIZES.spacing.big,
  },
  titleContainer: {
    backgroundColor: theme.palette.grey.white,
    padding: UI_SIZES.spacing.small,
  },
});
