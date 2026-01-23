import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { getScaleWidth, UI_SIZES } from '~/framework/components/constants';
import { TextSizeStyle } from '~/framework/components/text';

export const styles = StyleSheet.create({
  label: {
    ...TextSizeStyle.Normal,
  },
  labelWrapper: {
    flex: 1,
  },
  leftElement: {
    alignItems: 'flex-start',
    gap: UI_SIZES.spacing.small,
    justifyContent: 'center',
    width: getScaleWidth(34),
  },
  wrapper: {
    borderRadius: UI_SIZES.radius.medium,
    flexDirection: 'row',
    gap: UI_SIZES.spacing.small,
    justifyContent: 'flex-start',
    marginBottom: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.tiny,
    minHeight: getScaleWidth(41),
    padding: UI_SIZES.spacing.minor,
  },
  wrapperPressed: {
    backgroundColor: theme.palette.grey.pearl,
  },
});
