import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  bar: {
    backgroundColor: theme.palette.complementary.blue.regular,
    borderRadius: 4,
  },

  // Styles pour les barres horizontales (jour)
  barBackgroundHorizontal: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: 2,
    height: 20,
    justifyContent: 'center',
  },

  // Styles pour les barres verticales (semaine)
  barBackgroundVertical: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: 4,
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

  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  barContainerHorizontal: {
    alignItems: 'center',
    flex: 1,
    height: 20,
    justifyContent: 'flex-start',
    marginHorizontal: UI_SIZES.spacing.tiny,
  },

  barContainerVertical: {
    alignItems: 'center',
    height: 200,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },

  barHorizontal: {
    backgroundColor: theme.palette.complementary.blue.regular,
    borderRadius: 2,
    height: '100%',
  },

  barRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: UI_SIZES.spacing.small,
  },

  barsContainer: {
    flex: 1,
    paddingHorizontal: UI_SIZES.spacing.small,
  },

  barsContainerVertical: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },

  chartContainer: {
    marginBottom: UI_SIZES.spacing.medium,
  },

  chartContainerVertical: {
    flexDirection: 'row',
    height: 250,
    marginVertical: 16,
  },

  // Styles communs
  container: {
    backgroundColor: theme.palette.grey.white,
    borderColor: theme.palette.grey.cloudy,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 3,
    marginBottom: UI_SIZES.spacing.medium,
    padding: UI_SIZES.spacing.medium,
    shadowColor: theme.palette.grey.black,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  dayLabel: {
    color: theme.palette.grey.black,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },

  durationLabel: {
    color: theme.palette.grey.graphite,
    fontSize: 10,
    textAlign: 'center',
  },

  durationLabelHorizontal: {
    color: theme.palette.grey.graphite,
    fontSize: 10,
    marginLeft: UI_SIZES.spacing.tiny,
    textAlign: 'right',
    width: UI_SIZES.spacing.large,
  },

  hourLabel: {
    color: theme.palette.grey.black,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    width: 50,
  },

  noDataText: {
    color: theme.palette.grey.black,
    fontSize: 16,
    textAlign: 'center',
  },
  // Styles spécifiques au graphique du jour
  titleContainer: {
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
  totalTime: {
    color: theme.palette.primary.regular,
    fontSize: 14,
    fontWeight: '500',
  },
});
