import styled from '@emotion/native';



import { CommonStyles } from '~/styles/common/styles';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import { Weight } from '~/ui/Typography';


export const ListItem = styled.View(
  {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomColor: CommonStyles.borderBottomItem,
    flexDirection: 'row',
    borderBottomWidth: 1,
    justifyContent: 'center',
  },
  ({ highlighted = false }: { highlighted?: boolean }) => ({
    backgroundColor: highlighted ? CommonStyles.nonLue : '#FFFFFF',
  }),
);

export const LeftPanel = styled(TouchableOpacity)({
  justifyContent: 'center',
  width: 50,
  height: 66,
});

export const CenterPanel = styled(TouchableOpacity)({
  alignItems: 'flex-start',
  flex: 1,
  justifyContent: 'center',
  marginHorizontal: 6,
  padding: 2,
});

export const RightPanel = styled(TouchableOpacity)({
  alignItems: 'center',
  justifyContent: 'center',
  width: 50,
});

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