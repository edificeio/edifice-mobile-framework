import { StyleSheet } from 'react-native';

import styled from '@emotion/native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';

export const TrackingContainer = styled(TouchableOpacity)({
  flex: 1,
  flexDirection: 'row',
});

export const styles = StyleSheet.create({
  activityIndicator: {
    marginRight: UI_SIZES.spacing.huge,
  },
  container: {
    backgroundColor: theme.ui.background.card,
    elevation: 4,
    width: '100%',
  },
  icon: {
    marginRight: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.small,
  },
  innerRow: {
    flex: 1,
    flexDirection: 'row',
  },
  text: {
    alignSelf: 'center',
    flex: 1,
    marginLeft: UI_SIZES.spacing.large,
    textAlign: 'center',
  },
});
