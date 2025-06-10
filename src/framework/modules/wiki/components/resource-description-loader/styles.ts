import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';

const linePlaceholderBaseStyle = {
  backgroundColor: theme.palette.grey.pearl,
  borderRadius: UI_SIZES.radius.small,
  marginBottom: UI_SIZES.spacing.tiny,
};

export const styles = StyleSheet.create({
  cardContainer: {
    alignSelf: 'stretch',
    backgroundColor: theme.palette.grey.white,
    borderRadius: UI_SIZES.radius.mediumPlus,
    elevation: 4,
    marginHorizontal: UI_SIZES.spacing.big,
    marginTop: -UI_SIZES.cardSpacing.major,
    padding: UI_SIZES.spacing.medium,
    shadowColor: theme.palette.grey.darkness,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: UI_SIZES.radius.newCard / 2,
  },
  linePlaceholder: {
    ...linePlaceholderBaseStyle,
  },
  tinyLinePlaceholder: {
    ...linePlaceholderBaseStyle,
    width: getScaleWidth(108),
  },
});
