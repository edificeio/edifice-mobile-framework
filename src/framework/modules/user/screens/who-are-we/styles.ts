import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export default StyleSheet.create({
  animationWrapper: { aspectRatio: 3 },
  buttonDiscover: { marginTop: UI_SIZES.spacing.medium },
  buttonReview: { marginTop: UI_SIZES.spacing.large },
  quoteAuthor: { textAlign: 'right', marginBottom: UI_SIZES.spacing.large, color: theme.palette.grey.graphite },
  textWrapper: { padding: UI_SIZES.spacing.big, paddingTop: UI_SIZES.spacing.large },
});
