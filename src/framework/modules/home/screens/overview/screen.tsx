import React from 'react';
import { RefreshControl } from 'react-native';

import { MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';

import { I18n } from '~/app/i18n';
import { UI_STYLES } from '~/framework/components/constants';
import { EmptyScreen } from '~/framework/components/empty-screens';
import ScrollView from '~/framework/components/scrollView';
import { withSession } from '~/framework/modules/auth/util';
import { FlashMessageSection } from '~/framework/modules/home/components';
import { useFlashMessages, useHomeReload, useHomeReloadKeyBump } from '~/framework/modules/home/hooks';
import { getVisibleHomeSections } from '~/framework/modules/home/registry';

import styles from './styles';
import { HomeOverviewScreenProps } from './types';

export const HomeOverviewScreenOptions = (): MaterialTopTabNavigationOptions => ({
  tabBarButtonTestID: 'home-tab-overview',
  title: I18n.get('home-overview-title'),
});

export const HomeOverviewScreen = withSession<HomeOverviewScreenProps>(({ session }) => {
  const { dismiss: onDismissFlashMessage, load: loadFlashMessages, pristine, visible: flashMessages } = useFlashMessages();

  const reloadingFlashMessages = useHomeReload(loadFlashMessages);

  // The page asks every section to reload without waiting for any of them: each one shows its own
  // placeholder, so there is nothing left to coordinate here.
  const onRefresh = useHomeReloadKeyBump();

  const refreshControl = React.useMemo(() => <RefreshControl refreshing={false} onRefresh={onRefresh} />, [onRefresh]);

  const sections = React.useMemo(() => getVisibleHomeSections(session), [session]);

  // Every section hides itself when it has nothing to show, and the page is no list, so it would be
  // left blank. The first load is waited for, or this would flash on every opening.
  const isEmpty = !pristine && !flashMessages.length && !sections.length;

  return (
    <ScrollView
      style={UI_STYLES.flex1}
      contentContainerStyle={isEmpty ? styles.emptyContent : styles.content}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}>
      {isEmpty ? (
        <EmptyScreen
          svgImage="empty-hammock"
          title={I18n.get('home-overview-empty-title')}
          text={I18n.get('home-overview-empty-text')}
        />
      ) : (
        <React.Fragment>
          <FlashMessageSection
            flashMessages={flashMessages}
            loading={pristine || reloadingFlashMessages}
            onDismiss={onDismissFlashMessage}
          />

          {sections.map(section => (
            <React.Fragment key={section.name}>{section.renderComponent(session)}</React.Fragment>
          ))}
        </React.Fragment>
      )}
    </ScrollView>
  );
});
