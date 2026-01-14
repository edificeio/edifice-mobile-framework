import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bar: {
    backgroundColor: theme.palette.complementary.blue.regular,
    borderRadius: UI_SIZES.radius.medium,
  },

  // Styles pour les barres horizontales (jour)
  barBackgroundHorizontal: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: UI_SIZES.radius.small,
    height: UI_SIZES.dimensions.height.medium,
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
    height: 20,
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
    backgroundColor: theme.palette.complementary.blue.regular,
    borderRadius: UI_SIZES.radius.small,
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
    borderColor: theme.palette.grey.cloudy,
    borderLeftColor: theme.palette.complementary.blue.regular,
    borderLeftWidth: 4,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: UI_SIZES.border.thin,
    elevation: 3,
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.medium,
    shadowColor: theme.palette.grey.black,
    shadowOffset: {
      height: UI_SIZES.border.thin,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: UI_SIZES.radius.medium,
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

  noDataText: {
    color: theme.palette.grey.black,
    fontSize: getScaleFontSize(16),
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
    backgroundColor: theme.palette.complementary.blue.pale,
    borderRadius: UI_SIZES.radius.medium,
    marginTop: UI_SIZES.spacing.small,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  toggleButtonText: {
    color: theme.palette.complementary.blue.regular,
    fontSize: getScaleFontSize(12),
  },
  totalTime: {
    color: theme.palette.primary.regular,
    fontSize: getScaleFontSize(14),
  },
});
