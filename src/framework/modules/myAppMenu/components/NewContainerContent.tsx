import styled from '@emotion/native';

import { CommonStyles } from '~/styles/common/styles';
import { Weight } from '~/ui/Typography';

export const contentStyle = {
  color: CommonStyles.iconColorOff,
  fontFamily: CommonStyles.primaryFontFamily,
  fontSize: 12,
  fontWeight: Weight.Light,
};

export const Content = styled.Text(contentStyle, ({ nb = 0 }) => ({
  color: nb > 0 ? CommonStyles.textColor : CommonStyles.iconColorOff,
  fontWeight: nb > 0 ? Weight.Normal : Weight.Light,
}));

export const PageContainer = styled.View({
  backgroundColor: CommonStyles.lightGrey,
  flex: 1,
});
