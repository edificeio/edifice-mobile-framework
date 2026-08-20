import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

import { MOOD_SIZE } from '../constants';

export default StyleSheet.create({
  card: {
    borderBottomColor: theme.palette.grey.cloudy.toString(),
    borderBottomWidth: UI_SIZES.border.thin,
    gap: UI_SIZES.spacing.minor,
    padding: UI_SIZES.spacing.medium,
  },
  chip: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.palette.grey.fog.toString(),
    borderRadius: UI_SIZES.radius.huge,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.tiny,

    paddingLeft: UI_SIZES.spacing.tiny,
    paddingRight: UI_SIZES.spacing.small,
    paddingVertical: UI_SIZES.spacing.tinyExtra,
  },
  chipText: {
    flexShrink: 1,
  },
  date: {
    color: theme.palette.grey.graphite.toString(),
  },
  header: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.medium,
  },
  message: {
    flex: 1,
    gap: UI_SIZES.spacing.minor,
  },
  mood: {
    alignSelf: 'center',
    height: MOOD_SIZE,
    overflow: 'hidden',
    width: MOOD_SIZE,
  },
  moodImage: {
    height: '100%',
    width: '100%',
  },
});
