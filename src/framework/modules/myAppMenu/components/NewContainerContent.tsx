import styled from '@emotion/native';

import theme from '~/app/theme';
import { Weight } from '~/ui/Typography';

export const contentStyle = {
  color: theme.ui.text.light,
  fontFamily: 'OpenSans-Regular',
  fontSize: 12,
  fontWeight: Weight.Light,
};

export const Content = styled.Text(contentStyle, ({ nb = 0 }) => ({
  color: nb > 0 ? theme.ui.text.regular : theme.ui.text.light,
  fontWeight: nb > 0 ? Weight.Normal : Weight.Light,
}));
