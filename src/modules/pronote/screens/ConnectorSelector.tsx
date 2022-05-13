import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { PageView } from '~/framework/components/page';
import { IEntcoreApp } from '~/framework/util/moduleTool';
import { IUserSession, getUserSession } from '~/framework/util/session';

import DropdownSelector from '../components/DropdownSelector';
import redirect from '../service/redirect';

export interface IConnectorSelectorScreenDataProps {
  session: IUserSession;
}

export type IConnectorSelectorScreenProps = NavigationInjectedProps<{
  connectors: IEntcoreApp[];
}> &
  IConnectorSelectorScreenDataProps;

class ConnectorSelectorScreen extends React.PureComponent<IConnectorSelectorScreenProps> {
  public render() {
    const items = this.props.navigation.getParam('connectors', []).map(c => ({
      label: c.displayName,
      value: c.address,
    }));
    return (
      <PageView
        navigation={this.props.navigation}
        navBarWithBack={{
          title: I18n.t('Pronote'),
        }}>
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
    session: getUserSession(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(ConnectorSelectorScreen);
