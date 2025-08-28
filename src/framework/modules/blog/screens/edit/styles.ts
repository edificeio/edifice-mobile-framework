import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';
import stylesInputCreatePost from '~/framework/modules/blog/screens/create-post/styles';

export default StyleSheet.create({
  inputTitle: {
    ...stylesInputCreatePost.inputTitle,
  },
  page: {
    padding: UI_SIZES.spacing.medium,
    paddingBottom: 0,
  },
});
