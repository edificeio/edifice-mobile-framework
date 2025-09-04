import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    borderRadius: UI_SIZES.radius.mediumPlus,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  imgContainer: {
    aspectRatio: UI_SIZES.aspectRatios.banner,
    // give a border radius to override the one from ModuleImage
    borderRadius: 0,
  },
  infoBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    alignItems: 'stretch',
    gap: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.small,
  },
  infoInviterContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  infoInviterText: {
    color: theme.ui.text.inverse,
    flex: 1,
  },
  infoRoleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: UI_SIZES.spacing.minor,
  },
  infoSeparator: {
    backgroundColor: theme.ui.text.inverse,
    height: UI_SIZES.border.thin,
  },
  infoText: {
    color: theme.ui.text.inverse,
  },
  metadataContainer: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    gap: UI_SIZES.spacing.minor,
  },
});
