import { StyleSheet } from 'react-native';

import { layoutSize } from '../../constants/layoutSize';
import { CommonStyles } from '../styles/common/styles';

export const styles = StyleSheet.create({
  grid: {
      backgroundColor: CommonStyles.backgroundColor,
      justifyContent: 'center',
  },
  inputsPanel: {
    paddingLeft: layoutSize.LAYOUT_10,
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
  text: {
    color: CommonStyles.fontColor,
    fontSize: layoutSize.LAYOUT_7,
  },
  textBoldOverride:{
    fontWeight: 'bold',
  }
});
