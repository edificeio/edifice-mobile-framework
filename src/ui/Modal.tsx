import styled from '@emotion/native';
import NativeModal from 'react-native-modal';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { CommonStyles } from '~/styles/common/styles';
import { LightP } from '~/ui/Typography';

export const ModalBox = styled(NativeModal)({
  alignItems: 'stretch',
  // debug below
  // backgroundColor: theme.palette.complementary.red.regular
});

export const ModalContent = styled.View({
  alignItems: 'center',
  alignSelf: 'center',
  backgroundColor: theme.ui.background.card,
  borderRadius: 4,
  elevation: CommonStyles.elevation,
  flex: 0,
  justifyContent: 'center',
  paddingTop: UI_SIZES.spacing.large,
  shadowColor: CommonStyles.shadowColor,
  shadowOffset: CommonStyles.shadowOffset,
  shadowOpacity: CommonStyles.shadowOpacity,
  shadowRadius: CommonStyles.shadowRadius,
  width: 270,
});

export const ModalContentBlock = styled.View({
  alignItems: 'stretch',
  flex: 0,
  flexGrow: 0,
  marginBottom: UI_SIZES.spacing.large,
  marginHorizontal: UI_SIZES.spacing.big,
});

export const ModalContentText = styled(LightP)({
  textAlign: 'center',
});
