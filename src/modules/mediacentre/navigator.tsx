import { createStackNavigator } from 'react-navigation-stack';

import HomeContainer from './containers/HomeContainer';

export default () =>
  createStackNavigator(
    {
      Mediacentre: HomeContainer,
    },
    {
      headerMode: 'none',
    },
  );
