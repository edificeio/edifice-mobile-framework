import { StyleSheet } from 'react-native';

import theme from '~/app/theme';

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    backgroundColor: theme.palette.primary.regular,
    borderRadius: 50,
    padding: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  waveform: {
    borderColor: '#ccc',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 30,
  },
});

export default styles;
