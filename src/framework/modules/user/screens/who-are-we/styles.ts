import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  photoWrapper: { aspectRatio: 3 },
  photo: { width: '100%', height: '100%' },
  textWrapper: { padding: UI_SIZES.spacing.big },
  button: { marginTop: UI_SIZES.spacing.large },
});
