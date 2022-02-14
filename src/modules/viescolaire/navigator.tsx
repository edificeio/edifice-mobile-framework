import { createStackNavigator } from 'react-navigation-stack';

import HomeworkNavigator from './cdt/navigator';
import CompetencesNavigator from './competences/navigator';
import EdtNavigator from './edt/navigator';
import Declaration from './presences/containers/Declaration';
import PresencesNavigator from './presences/navigator';
import Dashboard from './viesco/containers/Dashboard';
import Memento from './viesco/containers/Memento';

export default () =>
  createStackNavigator({
    Dashboard,
    Declaration,
    Memento,
    edt: {
      screen: EdtNavigator,
      navigationOptions: {
        header: null,
      },
    },
    cdt: {
      screen: HomeworkNavigator,
      navigationOptions: {
        header: null,
      },
    },
    presences: {
      screen: PresencesNavigator,
      navigationOptions: {
        header: null,
      },
    },
    competences: {
      screen: CompetencesNavigator,
      navigationOptions: {
        header: null,
      },
    },
  });
