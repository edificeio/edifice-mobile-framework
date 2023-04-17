import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import I18n from 'i18n-js';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

import type { IGlobalState } from '~/app/store';
import { PageView } from '~/framework/components/page';
import type { ISession } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import DropdownSelector from '~/framework/modules/pronote/components/dropdown-selector';
import { PronoteNavigationParams, pronoteRouteNames } from '~/framework/modules/pronote/navigation';
import redirect from '~/framework/modules/pronote/service/redirect';
import { navBarOptions } from '~/framework/navigation/navBar';
import type { IEntcoreApp } from '~/framework/util/moduleTool';

export interface IConnectorSelectorScreenDataProps {
  session?: ISession;
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
    title: I18n.t('Pronote'),
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
          message={I18n.t('pronote.selector.title')}
          dropDownPickerProps={{
            items,
            showTickIcon: false,
            placeholder: I18n.t('pronote.selector.placeholder'),
          }}
          button={{
            text: I18n.t('pronote.selector.action'),
            action: v => {
              if (v && this.props.session) redirect(this.props.session, v as string);
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
    session: getSession(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(ConnectorSelectorScreen);
