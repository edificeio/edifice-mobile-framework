import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_STYLES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';

export default StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  listContainer: {
    flexGrow: 1,
    padding: pageGutterSize,
    rowGap: pageGutterSize,
  },
  listFooterContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  positionActionContainer: {
    width: 100,
  },
  saveActionContainer: {
    ...UI_STYLES.clickZone,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  summaryText: {
    alignSelf: 'center',
    color: theme.palette.primary.regular,
  },
});
