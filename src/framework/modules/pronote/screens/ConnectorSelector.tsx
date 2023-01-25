import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { PageView } from '~/framework/components/page';
import { ISession } from '~/framework/modules/auth/model';
import { navBarOptions } from '~/framework/navigation/navBar';
import { IEntcoreApp } from '~/framework/util/moduleTool';
import DropdownSelector from '~/modules/pronote/components/DropdownSelector';
import redirect from '~/modules/pronote/service/redirect';

import { getSession } from '../../auth/reducer';
import { PronoteNavigationParams, pronoteRouteNames } from '../navigation';

export interface IConnectorSelectorScreenDataProps {
  session: ISession;
}

export interface IConnectorSelectorScreenNavParams {
  connectors: IEntcoreApp[];
}

export type IConnectorSelectorScreenProps = NavigationInjectedProps<IConnectorSelectorScreenNavParams> &
  IConnectorSelectorScreenDataProps;

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PronoteNavigationParams, typeof pronoteRouteNames.connectorSelector>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
  }),
  title: I18n.t('Pronote'),
});

class ConnectorSelectorScreen extends React.PureComponent<IConnectorSelectorScreenProps> {
  public render() {
    const items = this.props.navigation.getParam('connectors', []).map(c => ({
      label: c.displayName,
      value: c.address,
    }));
    return (
      <PageView>
        <DropdownSelector
          message={I18n.t('pronote.selector.title')}
          dropDownPickerProps={{
            items,
            showTickIcon: false,
            placeholder: I18n.t('pronote.selector.placeholder'),
          }}
          button={{
            text: I18n.t('pronote.selector.action'),
            action: v => {
              if (v) redirect(this.props.session, v as string);
            },
            iconName: 'pictos-external-link',
          }}
        />
      </PageView>
    );
  }
}

export default connect(
  (state: IGlobalState) => ({
    session: getSession(state),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(ConnectorSelectorScreen);
