import I18n from 'i18n-js';
import * as React from 'react';
import { NativeEventEmitter } from 'react-native';

import { Filter } from '~/framework/modules/workspace/reducer';
import { isInOwnerWorkspace } from '~/navigation/NavigationService';
import { mainNavNavigate } from '~/navigation/helpers/navHelper';
import { ContentUri } from '~/types/contentUri';

export interface IProps {
  dispatch: any;
}

export default function withLinckingAppWrapper<T extends IProps>(WrappedComponent: React.ComponentType<T>): React.ComponentType<T> {
  return class extends React.PureComponent<T> {
    eventEmitter: NativeEventEmitter | null = null;

    private navigate(contentUri: ContentUri) {
      //this.props.dispatch(contentUriAction(contentUri instanceof Array ? contentUri : [contentUri]));
      // check to see if already in workspace
      if (!isInOwnerWorkspace())
        mainNavNavigate('workspace', {
          filter: Filter.ROOT,
          parentId: Filter.ROOT,
          title: I18n.t('workspace.tabName'),
          childRoute: 'workspace',
          childParams: {
            parentId: 'owner',
            filter: Filter.OWNER,
            title: I18n.t('owner'),
          },
        });
    }

    public render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}
