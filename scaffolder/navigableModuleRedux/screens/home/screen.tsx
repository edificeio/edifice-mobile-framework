import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { IGlobalState } from '~/AppStore';
import { PageView } from '~/framework/components/page';
import { BodyBoldText } from '~/framework/components/text';
import { tryAction } from '~/framework/util/redux/actions';

import { setFruitAction } from '../../actions';
import { getFruit } from '../../reducer';
import { {{moduleName | capitalize}}HomeScreenPrivateProps, {{moduleName | capitalize}}HomeScreenDispatchProps } from './types';

function {{moduleName | capitalize}}HomeScreen(props: {{moduleName | capitalize}}HomeScreenPrivateProps) {
  // HOOKS ========================================================================================

  const [someState, setSomeState] = React.useState<boolean>(false);

  // RENDER =======================================================================================

  return (
    <PageView>
      <BodyBoldText>{{moduleName}} Home</BodyBoldText>
      <BodyBoldText>{props.fruit}</BodyBoldText>
    </PageView>
  );
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
        handleChangeFruit: tryAction(setFruitAction, undefined) as unknown as {{moduleName | capitalize}}HomeScreenDispatchProps['handleChangeFruit'], // TS for react-redux still sux at this moment.
      },
      dispatch,
    ),
)({{moduleName | capitalize}}HomeScreen);
