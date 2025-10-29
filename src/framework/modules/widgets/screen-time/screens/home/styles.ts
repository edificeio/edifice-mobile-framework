import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

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
    paddingHorizontal: 16,
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
    fontSize: 16,
    lineHeight: 24,
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
    height: 1,
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
    borderRadius: 6,
    bottom: 4,
    left: 4,
    position: 'absolute',
    top: 4,
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 2,
  },
  tabToggleText: {
    color: theme.palette.grey.graphite,
    fontSize: 14,
    fontWeight: '500',
  },
  tabToggleTextActive: {
    color: theme.palette.primary.regular,
    fontWeight: '600',
  },
});
