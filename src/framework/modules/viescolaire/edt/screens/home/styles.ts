import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';

export default StyleSheet.create({
  childPickerContentContainer: {
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingTop: UI_SIZES.spacing.medium,
  },
  weekPickerView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: UI_SIZES.spacing.medium,
  },
  weekText: {
    marginRight: UI_SIZES.spacing.minor,
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
