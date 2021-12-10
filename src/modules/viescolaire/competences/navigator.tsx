import { createStackNavigator } from 'react-navigation-stack';

import Evaluation from './containers/Evaluation';

export default createStackNavigator(
  {
    EvaluationList: {
      screen: Evaluation,
    },
  },
  {
    headerMode: 'screen',
  },
);
