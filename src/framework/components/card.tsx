import styled from '@emotion/native'
import theme from '../util/theme';
import { ViewStyle } from "react-native";

const cardStyle: ViewStyle = {
  backgroundColor: theme.color.background.card,
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 15
};

const cardShadow: ViewStyle = {
  shadowColor: theme.color.shadowColor,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 1,
  elevation: 1
}

export const Card = styled.View(cardStyle, cardShadow);
export const TouchCard = styled.TouchableOpacity(cardStyle, cardShadow);
export const InfoCard = styled.View(cardStyle, {backgroundColor: theme.color.secondary.light});
