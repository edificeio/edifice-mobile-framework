import styled from '@emotion/native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';

export const ArticleContainer = styled.View({
  paddingHorizontal: pageGutterSize,
  paddingVertical: pageGutterSize,
  paddingTop: 0,
});

export const Header = styled.View({
  alignItems: 'stretch',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  marginBottom: 6, // MO-142 use UI_SIZES.spacing here
  minHeight: 50,
  width: '100%',
});

export const LeftPanel = styled.View({
  justifyContent: 'center',
  width: 50,
  minHeight: 50,
});

export const CenterPanel = styled.View({
  alignItems: 'flex-start',
  flex: 1,
  justifyContent: 'center',
  marginHorizontal: UI_SIZES.spacing.minor,
  padding: UI_SIZES.spacing.tiny / 2, // MO-142 use UI_SIZES.spacing here
});

export const PageContainer = styled.View({
  backgroundColor: theme.ui.background.page,
  flex: 1,
});
