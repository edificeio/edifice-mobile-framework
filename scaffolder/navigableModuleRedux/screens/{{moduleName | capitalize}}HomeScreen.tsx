import * as React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';

import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { IGlobalState } from "~/AppStore";

import { I{{moduleName | capitalize}}NavigationParams } from '../navigation';
import { getFruit, I{{moduleName | capitalize}}State } from '../reducer';
import { bindActionCreators } from 'redux';
import { tryAction } from '~/framework/util/redux/actions';
import { setFruitAction } from '../actions';

// TYPES ==========================================================================================

export interface I{{moduleName | capitalize}}HomeScreenDataProps {
  fruit: I{{moduleName | capitalize}}State['fruit'];
}

export interface I{{moduleName | capitalize}}HomeScreenEventProps {
  handleChangeFruit: (...args: Parameters<typeof setFruitAction>) => Promise<void>;
}

export interface I{{moduleName | capitalize}}HomeScreenProps extends 
  I{{moduleName | capitalize}}HomeScreenDataProps,
  I{{moduleName | capitalize}}HomeScreenEventProps,
  NativeStackScreenProps<I{{moduleName | capitalize}}NavigationParams, 'Home'> {
    // @scaffolder add props here
  };

// COMPONENT ======================================================================================

function {{moduleName | capitalize}}HomeScreen (props: I{{moduleName | capitalize}}HomeScreenProps) {

  // HOOKS ========================================================================================

  const [someState, setSomeState] = React.useState<boolean>(false);

  // RENDER =======================================================================================

  return <PageView>
    <BodyBoldText>{{moduleName}} Home</BodyBoldText>
  </PageView>;

}

// REDUX ==========================================================================================

export default connect(
  (state: IGlobalState) => {
    return {
      fruit: getFruit(state),
    };
  },
  dispatch =>
    bindActionCreators(
      {
        handleChangeFruit: tryAction(setFruitAction, undefined)
      },
      dispatch,
    ),
)({{moduleName | capitalize}}HomeScreen);
