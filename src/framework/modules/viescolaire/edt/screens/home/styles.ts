import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';

export default StyleSheet.create({
  header: {
    backgroundColor: theme.palette.grey.white,
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
    padding: UI_SIZES.spacing.small,
    borderRadius: UI_SIZES.radius.small,
    backgroundColor: theme.palette.grey.white,
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
