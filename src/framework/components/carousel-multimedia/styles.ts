import { StyleSheet } from 'react-native';

import { UI_SIZES } from '../constants';

const styles = StyleSheet.create({
  carouselContainer: { flex: 1 },
  container: { backgroundColor: 'black', flex: 1, flexDirection: 'column' },
  item: { flex: 1 },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    flex: 1,
    justifyContent: 'center',
  },
  mediaContainer: {
    height: '100%',
    width: '100%',
  },
  mediaPdfContainer: {
    flex: 1,
  },
  paginationContainer: { gap: 4 },
  paginationDots: { backgroundColor: 'white', borderRadius: 50 },
  paginationWrapper: { backgroundColor: 'transparent', padding: UI_SIZES.spacing.medium },
  text: { color: 'white', fontSize: 30, textAlign: 'center' },
  title: {
    width: undefined,
  },
});

export default styles;
