import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, getScaleWidth } from '~/framework/components/constants';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';

const WIDTH_TEXT_TAB = getScaleWidth(20);

export default StyleSheet.create({
  header: {
    backgroundColor: theme.palette.grey.white,
    zIndex: 1000,
  },
  childPicker: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.grey,
  },
  childPickerContentContainer: {
    padding: UI_SIZES.spacing.medium,
  },
  weekPickerView: {
    backgroundColor: theme.palette.grey.white,
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_SIZES.spacing.medium,
    paddingBottom: 0,
    zIndex: -1,
  },
  weekText: {
    marginLeft: UI_SIZES.spacing.tiny,
    marginRight: UI_SIZES.spacing.minor,
  },
  tabBar: {
    backgroundColor: theme.palette.grey.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.grey,
  },
  tabBarIndicator: {
    backgroundColor: theme.palette.grey.white,
  },
  tabBarItem: {
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.small,
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 2,
  },
  tabBarItemText: {
    textAlign: 'center',
    width: WIDTH_TEXT_TAB,
  },
  courseView: {
    flexDirection: 'row',
    padding: UI_SIZES.spacing.minor,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
  },
  subjectView: {
    maxWidth: '56%',
  },
  roomView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  halfCourseView: {
    flexShrink: 1,
    padding: UI_SIZES.spacing.minor,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
  },
  halfSplitLineView: {
    flexDirection: 'row',
  },
  halfTextStyle: {
    flex: 1,
  },
  halfRoomLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taggedCourseBackground: {
    backgroundColor: theme.palette.grey.cloudy,
  },
  activeCourseBorder: {
    borderColor: viescoTheme.palette.edt,
    borderWidth: 2,
  },
});
