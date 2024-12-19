import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import type { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import type { AuthLoggedAccount } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import DropdownSelector from '~/framework/modules/pronote/components/dropdown-selector';
import { PronoteNavigationParams, pronoteRouteNames } from '~/framework/modules/pronote/navigation';
import redirect from '~/framework/modules/pronote/service/redirect';
import { navBarOptions } from '~/framework/navigation/navBar';
import type { IEntcoreApp } from '~/framework/util/moduleTool';

export interface IConnectorSelectorScreenDataProps {
  session?: AuthLoggedAccount;
}

export interface IConnectorSelectorScreenNavParams {
  connectors: IEntcoreApp[];
}

export type IConnectorSelectorScreenProps = NativeStackScreenProps<
  PronoteNavigationParams,
  typeof pronoteRouteNames.connectorSelector
> &
  IConnectorSelectorScreenDataProps;

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<PronoteNavigationParams, typeof pronoteRouteNames.connectorSelector>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('pronote'),
  }),
});

class ConnectorSelectorScreen extends React.PureComponent<IConnectorSelectorScreenProps> {
  public render() {
    const items = (this.props.route.params.connectors ?? []).map(c => ({
      label: c.displayName,
      value: c.address,
    }));
    return (
      <PageView>
        <DropdownSelector
          message={I18n.get('pronote-connectorselector-title')}
          dropDownPickerProps={{
            items,
            placeholder: I18n.get('pronote-connectorselector-placeholder'),
            showTickIcon: false,
          }}
          button={{
            action: v => {
              if (v && this.props.session) redirect(this.props.session, v as string);
            },
            iconRight: 'pictos-external-link',
            text: I18n.get('pronote-connectorselector-action'),
          }}
        />
      </PageView>
    );
  }
}

export default connect(
  (state: IGlobalState) => ({
    session: getSession(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(ConnectorSelectorScreen);
