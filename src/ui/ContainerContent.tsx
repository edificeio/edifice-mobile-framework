import styled from '@emotion/native';



import { layoutSize } from '~/styles/common/layoutSize';
import { CommonStyles } from '~/styles/common/styles';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';



import { Weight } from './Typography';


export const ArticleContainer = styled.View({
  padding: 5
});

export const ListItem = styled(TouchableOpacity)<{
  borderBottomWidth: number; full: boolean; nb: number;
}>(
  {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: layoutSize.LAYOUT_10,
    paddingVertical: layoutSize.LAYOUT_12,
    borderBottomColor: CommonStyles.borderBottomItem,
    flexDirection: 'row',
  },
  ({ borderBottomWidth = 1, full = false, nb = 0 }) => ({
    borderLeftWidth: full ? 4 : 0,
    borderLeftColor: full ? CommonStyles.hightlightColor : 'transparent',
    backgroundColor: nb > 0 ? CommonStyles.nonLue : '#FFFFFF',
    borderBottomWidth,
  }),
);

export const Header = styled.View({
  alignItems: 'stretch',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  marginBottom: 6,
  minHeight: layoutSize.LAYOUT_50,
  width: '100%',
});

export const LeftPanel = styled.View({
  justifyContent: 'center',
  minHeight: layoutSize.LAYOUT_50,
  width: layoutSize.LAYOUT_50,
});

export const LeftIconPanel = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: layoutSize.LAYOUT_54,
  width: layoutSize.LAYOUT_50,
  margin: 0,
  marginRight: layoutSize.LAYOUT_10,
});

export const LeftSmallIconPanel = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: layoutSize.LAYOUT_34,
  width: layoutSize.LAYOUT_30,
  margin: 0,
  marginRight: layoutSize.LAYOUT_5,
});

export const CenterPanel = styled.View({
  alignItems: 'flex-start',
  flex: 1,
  justifyContent: 'center',
  marginHorizontal: 6,
  padding: 2,
});

export const RightPanel = styled.View({
  alignItems: 'center',
  height: layoutSize.LAYOUT_50,
  justifyContent: 'flex-end',
  width: layoutSize.LAYOUT_50,
});

export const Content = styled.Text<{nb: number}>(
  {
    color: CommonStyles.iconColorOff,
    fontFamily: CommonStyles.primaryFontFamily,
    fontSize: layoutSize.LAYOUT_12,
    fontWeight: Weight.Light,
    marginTop: 10,
  },
  ({ nb = 0 }) => ({
    color: nb > 0 ? CommonStyles.textColor : CommonStyles.iconColorOff,
    fontWeight: nb > 0 ? Weight.Normal : Weight.Light,
  }),
);

export const PageContainer = styled.View({
  backgroundColor: CommonStyles.lightGrey,
  flex: 1,
});