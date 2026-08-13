import * as React from 'react';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import ScrollView from '~/framework/components/scrollView';
import { FlashMessageList } from '~/framework/modules/home/components';
import { dismissFlashMessageAction, loadFlashMessagesAction } from '~/framework/modules/timeline/actions';
import timelineConfig from '~/framework/modules/timeline/module-config';

import styles from './styles';

// Options must stay a function: `I18n.init()` is async, so a key read at module scope would be raw.
export const HomeOverviewScreenOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-overview',
  title: I18n.get('home-overview-title'),
});

export function HomeOverviewScreen() {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  // Flash messages still belongs to the timeline module, which owns their service and their store.
  const flashMessages = useSelector(state => timelineConfig.getState(state).flashMessages.data);

  React.useEffect(() => {
    dispatch(loadFlashMessagesAction());
  }, [dispatch]);

  const onDismiss = React.useCallback((id: number) => dispatch(dismissFlashMessageAction(id)), [dispatch]);

  const visibleFlashMessages = React.useMemo(() => flashMessages.filter(flashMessage => !flashMessage.dismiss), [flashMessages]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <FlashMessageList flashMessages={visibleFlashMessages} onDismiss={onDismiss} />
    </ScrollView>
  );
}
