import { StyleSheet } from 'react-native';

import { UI_SIZES } from '~/framework/components/constants';

export const styles = StyleSheet.create({
  cardContainer: {
    alignSelf: 'center',
    borderRadius: UI_SIZES.radius.mediumPlus,
    height: UI_SIZES.elements.communities.cardSmallHeight,
    width: UI_SIZES.elements.communities.cardSmallWidth,
  },
});
