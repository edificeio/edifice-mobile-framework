import { StyleSheet } from 'react-native';

import theme from '~/app/theme';

export default StyleSheet.create({
  block: {
    // Fallback for an app the store does not know, so the block keeps a background.
    backgroundColor: theme.palette.grey.pearl.toString(),
    overflow: 'hidden',
  },
  name: {
    // Only the icon takes the color of the app.
    color: theme.palette.grey.black.toString(),
    flexShrink: 1,
  },
  text: {
    // Same color as the title. Only the date is greyed out.
    color: theme.palette.grey.black.toString(),
  },
});
