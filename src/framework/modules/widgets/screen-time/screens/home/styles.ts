import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.medium,
  },
  childPickerContainer: {
    marginBottom: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.small,
    zIndex: 1000,
  },
  container: {
    flex: 1,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  datePicker: {
    alignSelf: 'center',
  },
  datePickerContainer: {
    alignItems: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
  dropdownPicker: {
    marginBottom: UI_SIZES.spacing.small,
    zIndex: 1001,
  },
  infoIcon: {
    marginLeft: UI_SIZES.spacing.tiny,
  },
  modalContent: {
    padding: UI_SIZES.spacing.medium,
  },
  modalText: {
    color: theme.palette.grey.black,
    fontSize: getScaleFontSize(16),
  },
  modeToggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: UI_SIZES.spacing.medium,
  },
  sectionTitle: {
    color: theme.palette.grey.black,
    marginBottom: UI_SIZES.spacing.tiny,
    marginTop: UI_SIZES.spacing.tiny,
    marginVertical: UI_SIZES.spacing.tiny,
  },
  sectionTitleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  separator: {
    backgroundColor: theme.palette.grey.cloudy,
    height: UI_SIZES.border.thin,
    marginVertical: UI_SIZES.spacing.tiny,
  },
  tabToggleBackground: {
    backgroundColor: theme.palette.grey.pearl,
    borderRadius: 8,
    flexDirection: 'row',
    padding: 4,
    position: 'relative',
  },
  tabToggleIndicator: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
    bottom: UI_SIZES.spacing.tiny,
    left: UI_SIZES.spacing.tiny,
    position: 'absolute',
    top: UI_SIZES.spacing.tiny,
    width: '50%',
    zIndex: 1,
  },
  tabToggleIndicatorRight: {
    left: '50%',
  },
  tabToggleItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.tiny,
    zIndex: 2,
  },
  tabToggleText: {
    color: theme.palette.grey.graphite,
    fontSize: getScaleFontSize(14),
  },
  tabToggleTextActive: {
    color: theme.palette.primary.regular,
  },
});
