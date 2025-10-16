import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';
import viescoTheme from '~/framework/modules/viescolaire/common/theme';

export default StyleSheet.create({
  activeCourseBorder: {
    borderColor: viescoTheme.palette.edt,
    borderWidth: 2,
  },
  childPicker: {
    borderBottomColor: theme.palette.grey.grey,
    borderBottomWidth: 1,
  },
  childPickerContentContainer: {
    padding: UI_SIZES.spacing.medium,
  },
  courseView: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    height: '100%',
    justifyContent: 'space-between',
    padding: UI_SIZES.spacing.minor,
  },
  firstTextLine: {
    flexShrink: 0,
    marginTop: TextSizeStyle.Normal.fontSize - TextSizeStyle.Normal.lineHeight,
    position: 'relative',
    top: (TextSizeStyle.Normal.lineHeight - TextSizeStyle.Normal.fontSize) / 2,
  },
  halfCourseView: {
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.medium,
    flexShrink: 1,
    height: '100%',
    justifyContent: 'center',
    padding: UI_SIZES.spacing.minor,
  },
  halfRoomLabelContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingTop: (TextSizeStyle.Normal.lineHeight - TextSizeStyle.Small.lineHeight) / 2,
  },
  halfSplitLineView: {
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
  },
  halfTextStyle: {
    flex: 1,
  },
  header: {
    backgroundColor: theme.palette.grey.white,
    zIndex: 1000,
  },
  roomView: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingTop: (TextSizeStyle.Normal.lineHeight - TextSizeStyle.Small.lineHeight) / 2,
  },
  subjectView: {
    maxWidth: '56%',
  },
  tabBar: {
    backgroundColor: theme.palette.grey.white,
    borderBottomColor: theme.palette.grey.grey,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.small,
  },
  tabBarItem: {
    borderRadius: UI_SIZES.radius.medium,
    borderWidth: 2,
    gap: 2,
    paddingHorizontal: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.minor,
  },

  tabBarItemContainer: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: UI_SIZES.spacing.small,
  },
  tabBarItemText: {
    paddingHorizontal: UI_SIZES.spacing.tinyExtra,
    textAlign: 'center',
  },
  taggedCourseBackground: {
    backgroundColor: theme.palette.grey.cloudy,
  },
  weekPickerView: {
    alignItems: 'center',
    backgroundColor: theme.palette.grey.white,
    flexDirection: 'row',
    padding: UI_SIZES.spacing.medium,
    paddingBottom: 0,
  },
  weekText: {
    marginLeft: UI_SIZES.spacing.tiny,
    marginRight: UI_SIZES.spacing.minor,
  },
});
