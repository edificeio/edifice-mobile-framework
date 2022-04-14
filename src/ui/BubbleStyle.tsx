import styled from '@emotion/native';
import { ViewStyle } from 'react-native';



import { CommonStyles } from '~/styles/common/styles';


export const BubbleStyle = styled.View<{
  my: boolean
}>(
  {
    alignSelf: 'stretch',
    elevation: 2,
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
  ({ my, style }): ViewStyle => ({
    backgroundColor: my ? CommonStyles.iconColorOn : 'white',
    ...style as ViewStyle,
  }),
);

export const BubbleScrollStyle = styled.ScrollView<{
  my: boolean
}>(
  {
    alignSelf: 'stretch',
    elevation: 2,
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
  ({ my, style }): ViewStyle => ({
    backgroundColor: my ? CommonStyles.iconColorOn : 'white',
    ...style as ViewStyle,
  }),
);