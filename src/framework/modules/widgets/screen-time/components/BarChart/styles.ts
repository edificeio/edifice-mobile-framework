import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const HORIZONTAL_BAR_HEIGHT = 20;

export default StyleSheet.create({
  bar: {
    backgroundColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.medium,
  },

  // Styles pour les barres horizontales (jour)
  barBackgroundHorizontal: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.medium,
    height: getScaleWidth(HORIZONTAL_BAR_HEIGHT),
    justifyContent: 'center',
  },

  // Styles pour les barres verticales (semaine)
  barBackgroundVertical: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.medium,
    height: 200,
    justifyContent: 'flex-end',
    width: 30,
  },

  // Styles spécifiques au graphique de la semaine
  barColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },

  barContainerHorizontal: {
    alignItems: 'center',
    flex: 1,
    height: getScaleWidth(HORIZONTAL_BAR_HEIGHT),
    justifyContent: 'flex-start',
    marginHorizontal: UI_SIZES.spacing.medium,
  },

  barContainerVertical: {
    alignItems: 'center',
    height: 200,
    justifyContent: 'flex-end',
    marginBottom: UI_SIZES.spacing.medium,
  },

  barHorizontal: {
    backgroundColor: theme.palette.complementary.yellow.regular,
    borderRadius: UI_SIZES.radius.medium,
    height: '100%',
  },

  barRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.medium,
  },

  barsContainer: {
    flex: 1,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },

  barsContainerVertical: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'relative',
    zIndex: 1,
  },

  chartContainer: {
    marginBottom: UI_SIZES.spacing.medium,
  },

  chartContainerVertical: {
    flexDirection: 'row',
    height: 250,
    marginVertical: UI_SIZES.spacing.medium,
  },
  chartWithGrid: {
    flex: 1,
    position: 'relative',
  },
  // Styles communs
  container: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.primary.regular,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    marginBottom: UI_SIZES.spacing.medium,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
  },

  dayLabel: {
    color: theme.palette.grey.black,
    fontSize: getScaleFontSize(12),
    marginBottom: UI_SIZES.spacing.small,
  },

  durationLabel: {
    color: theme.palette.grey.graphite,
    fontSize: getScaleFontSize(12),
    height: UI_SIZES.dimensions.height.medium,
    textAlign: 'center',
  },

  durationLabelHorizontal: {
    color: theme.palette.grey.graphite,
    fontSize: getScaleFontSize(12),
    marginLeft: UI_SIZES.spacing.tiny,
    textAlign: 'right',
  },
  gridContainer: {
    bottom: 0,
    height: 183,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  gridLine: {
    backgroundColor: theme.palette.grey.cloudy,
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    width: '100%',
  },

  hourLabel: {
    color: theme.palette.grey.black,
    fontSize: getScaleFontSize(12),
    textAlign: 'center',
  },

  scaleContainer: {
    alignItems: 'flex-end',
    height: 183,
    justifyContent: 'flex-end',
    marginBottom: UI_SIZES.spacing.medium,
    marginLeft: UI_SIZES.spacing.tiny,
    marginRight: UI_SIZES.spacing.tinyExtra,
    position: 'relative',
  },
  scaleLabel: {
    position: 'absolute',
    right: 0,
  },

  scaleText: {
    color: theme.palette.grey.graphite,
    fontSize: getScaleFontSize(12),
    textAlign: 'right',
  },
  // Styles spécifiques au graphique du jour
  titleContainer: {
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
  toggleButton: {
    marginTop: UI_SIZES.spacing.small,
  },
  totalTime: {
    fontSize: getScaleFontSize(14),
  },
});
