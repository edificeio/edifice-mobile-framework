import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_STYLES } from '~/framework/components/constants';
import { pageGutterSize } from '~/framework/components/page';

export default StyleSheet.create({
  saveActionContainer: {
    ...UI_STYLES.clickZone,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryText: {
    alignSelf: 'center',
    color: theme.palette.primary.regular,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  positionActionContainer: {
    width: 100,
  },
  listFooterContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  listContainer: {
    flexGrow: 1,
    padding: pageGutterSize,
    rowGap: pageGutterSize,
  },
});
