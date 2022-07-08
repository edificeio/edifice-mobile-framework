import I18n from 'i18n-js';
import * as React from 'react';
import { NavigationInjectedProps } from 'react-navigation';

import { PageView } from '~/framework/components/page';
import { IEntcoreApp } from '~/framework/util/moduleTool';
import DropdownSelector from '~/modules/pronote/components/DropdownSelector';

export interface IConnectorSelectorProps
  extends NavigationInjectedProps<{
    connectors: IEntcoreApp[];
  }> {}

class ConnectorSelector extends React.PureComponent<IConnectorSelectorProps> {
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
            url: v => (v ? (v as string) : 'aaa'), // This space is to have a dummy truthy value
          }}
        />
      </PageView>
    );
  }
}

export default ConnectorSelector;
