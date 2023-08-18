import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  classroomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: UI_SIZES.spacing.minor,
  },
  classroomText: {
    marginLeft: UI_SIZES.spacing.tiny,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: UI_SIZES.spacing.medium,
  },
  listContentContainer: {
    paddingHorizontal: UI_SIZES.spacing.minor,
  },
  nameText: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  validateButton: {
    margin: UI_SIZES.spacing.medium,
  },
});
