import styled from '@emotion/native';
import { ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { CommonStyles } from '~/styles/common/styles';

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
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
  ({ my, style }): ViewStyle => ({
    backgroundColor: my ? CommonStyles.iconColorOn : theme.ui.background.card,
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
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
  ({ my, style }): ViewStyle => ({
    backgroundColor: my ? CommonStyles.iconColorOn : theme.ui.background.card,
    ...(style as ViewStyle),
  }),
);
