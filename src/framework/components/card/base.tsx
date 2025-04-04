import { ViewStyle } from 'react-native';

import styled from '@emotion/native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';

export const cardPaddingV = UI_SIZES.spacing.medium;
export const cardPaddingH = UI_SIZES.spacing.medium;
export const cardPadding: ViewStyle = { paddingHorizontal: cardPaddingH, paddingVertical: cardPaddingV };
export const cardPaddingEqual: ViewStyle = { paddingHorizontal: 0, paddingVertical: cardPaddingH - cardPaddingV };
export const cardPaddingMerging: ViewStyle = { paddingBottom: cardPaddingV, paddingHorizontal: cardPaddingH };
export const cardPaddingSmall: ViewStyle = { paddingHorizontal: cardPaddingH, paddingVertical: (cardPaddingV * 2) / 3 };

const cardStyle: ViewStyle = {
  backgroundColor: theme.ui.background.card,
  borderRadius: UI_SIZES.radius.card,
};

export const cardShadow: ViewStyle = {
  elevation: 1,
  shadowColor: theme.ui.shadowColor,
  shadowOffset: { height: 1, width: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 1,
};

export const Card = styled.View(cardStyle, cardPadding, cardShadow);
export const CardWithoutPadding = styled.View(cardStyle, cardShadow);
export const CardPaddingEqual = styled.View(cardStyle, cardPaddingEqual);
export const TouchCard = styled.TouchableOpacity(cardStyle, cardPadding, cardShadow);
export const TouchCardWithoutPadding = styled.TouchableOpacity(cardStyle, cardShadow);
export const TouchCardPaddingEqual = styled.TouchableOpacity(cardStyle, cardPaddingEqual);
export const InfoCard = styled.View(cardStyle, cardPadding, { backgroundColor: theme.palette.primary.light });
