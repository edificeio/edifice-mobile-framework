import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleHeight, getScaleWidth, UI_SIZES, UI_VALUES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: theme.palette.primary.regular,
  },
  // Behind the card: closes the onboarding when pressed, as `ModalBox` did
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: `rgba(0, 0, 0, ${UI_VALUES.opacity.modal})`,
  },
  bottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: UI_SIZES.spacing.large,
  },
  // The card of `ModalBox`, with the padding the old modal gave it
  card: {
    backgroundColor: theme.ui.background.card,
    borderRadius: UI_SIZES.radius.extraLarge,
    marginBottom: UI_SIZES.screen.bottomInset + UI_SIZES.elements.tabbarHeight,
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.elements.navbarHeight + UI_SIZES.screen.topInset,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.big,
  },
  carousel: {
    alignItems: 'center',
  },
  carouselInner: {
    height: getScaleHeight(319),
  },
  // The close button of `ModalBox`
  closeButton: {
    position: 'absolute',
    right: UI_SIZES.spacing.medium,
    top: UI_SIZES.spacing.medium,
  },
  container: {
    paddingTop: UI_SIZES.spacing.medium,
  },
  dot: {
    backgroundColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.spacing.small,
    height: UI_SIZES.spacing.small,
    width: UI_SIZES.spacing.small,
  },
  navButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 0,
  },
  navButtonPrimary: {
    color: theme.palette.grey.graphite,
    flexShrink: 1,
    fontSize: getScaleWidth(14),
  },
  navButtonText: {
    color: theme.palette.primary.regular,
    flexShrink: 1,
    fontSize: getScaleWidth(14),
  },
  navSide: {
    maxWidth: '50%',
  },
  pagination: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  // The whole screen, the card in its middle
  screen: {
    flex: 1,
    justifyContent: 'center',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  top: {
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.small,
  },
});
