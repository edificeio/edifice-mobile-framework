import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleFontSize, UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: UI_SIZES.spacing.medium,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: UI_SIZES.spacing.medium,
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
  sectionTitleDot: {
    backgroundColor: theme.palette.complementary.blue.regular,
    borderRadius: UI_SIZES.radius.medium,
    height: 8,
    marginRight: UI_SIZES.spacing.tiny,
    width: 8,
  },
  separator: {
    backgroundColor: theme.palette.grey.cloudy,
    height: 2,
    marginVertical: UI_SIZES.spacing.tiny,
  },
  tabToggleBackground: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: 8,
    flexDirection: 'row',
    padding: 4,
    position: 'relative',
  },
  tabToggleIndicator: {
    backgroundColor: theme.palette.complementary.blue.pale,
    borderRadius: UI_SIZES.radius.medium,
    bottom: UI_SIZES.spacing.tiny,
    left: UI_SIZES.spacing.tiny,
    position: 'absolute',
    top: UI_SIZES.spacing.tiny,
    width: '50%',
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
  },
  tabToggleText: {
    fontSize: getScaleFontSize(14),
  },
});
