import styled from '@emotion/native';
import { ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const BubbleStyle = styled.View<{
  my: boolean;
}>(
  {
    alignSelf: 'stretch',
    elevation: 2,
    justifyContent: 'center',
    marginBottom: UI_SIZES.spacing.small,
    marginTop: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  ({ my, style }): ViewStyle => ({
    backgroundColor: my ? theme.palette.complementary.blue.regular : theme.ui.background.card,
    ...(style as ViewStyle),
  }),
);

export const BubbleScrollStyle = styled.ScrollView<{
  my: boolean;
}>(
  {
    alignSelf: 'stretch',
    elevation: 2,
    justifyContent: 'center',
    marginBottom: UI_SIZES.spacing.small,
    marginTop: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
    paddingVertical: UI_SIZES.spacing.small,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  ({ my, style }): ViewStyle => ({
    backgroundColor: my ? theme.palette.complementary.blue.regular : theme.ui.background.card,
    ...(style as ViewStyle),
  }),
);
