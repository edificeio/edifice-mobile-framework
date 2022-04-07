import styled from '@emotion/native';



import { CommonStyles } from '~/styles/common/styles';



import TouchableOpacity from './CustomTouchableOpacity';


export const TouchCard = styled(TouchableOpacity)({
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderRadius: 15,
  borderBottomColor: CommonStyles.borderBottomItem,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 1,
  elevation: 1,
  flexDirection: 'column',
});

export const Card = styled.View({
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomColor: CommonStyles.borderBottomItem,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.4,
  shadowRadius: 2,
  elevation: 1,
  flexDirection: 'column',
});