import { StyleSheet } from 'react-native';

import { layoutSize } from '../../constants/layoutSize';
import { CommonStyles } from '../styles/common/styles';

export const styles = StyleSheet.create({
  grid: {
      backgroundColor: CommonStyles.backgroundColor,
      justifyContent: 'center',
      flex: 1,
      marginHorizontal: layoutSize.LAYOUT_20,
  },
  inputsPanel: {
    paddingTop: layoutSize.LAYOUT_10,
  },
  buttonPanel: {
    marginTop: layoutSize.LAYOUT_5,
  },
  linksPanel: {
    marginTop: layoutSize.LAYOUT_7,
  },
  line: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    margin: layoutSize.LAYOUT_10,
  },
  text: {
    color: CommonStyles.fontColor,
    fontSize: layoutSize.LAYOUT_8,
  },
  minitext: {
    color: CommonStyles.fontColor,
    fontSize: layoutSize.LAYOUT_8,
    textDecorationLine: 'underline',
  },
  textBoldOverride:{
    fontWeight: 'bold',
  }
});
