import * as React from 'react';

import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { Fade, Placeholder } from 'rn-placeholder';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { AccountType, AuthActiveAccount } from '~/framework/modules/auth/model';
import { useHomeReload } from '~/framework/modules/home/hooks';
import { WidgetCard } from '~/framework/modules/widgets/components/card';
import { WidgetMessage } from '~/framework/modules/widgets/components/message';
import { WidgetUserPanel } from '~/framework/modules/widgets/components/user-panel';
import { useSelectedChild } from '~/framework/modules/widgets/hooks';
import { ScreenTimeDuration, ScreenTimeDurationPlaceholder } from '~/framework/modules/widgets/screen-time/components/duration';
import { ScreenTimeMessage } from '~/framework/modules/widgets/screen-time/components/message';
import { useScreenTimeSummary, useScreenTimeUsers } from '~/framework/modules/widgets/screen-time/hooks/screen-time';
import { screenTimeRouteNames } from '~/framework/modules/widgets/screen-time/navigation';
import { selectedChildStorage } from '~/framework/modules/widgets/screen-time/storage';

import styles from './styles';

export interface ScreenTimeWidgetProps {
  session: AuthActiveAccount;
}

export function ScreenTimeWidget({ session }: Readonly<ScreenTimeWidgetProps>) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const users = useScreenTimeUsers(session);
  const isRelative = session.user.type === AccountType.Relative;

  const { select, selected } = useSelectedChild(users, selectedChildStorage);

  const { error, load, loading, today, yesterday } = useScreenTimeSummary(selected?.id);

  // Loads on mount, then every time the home is opened again or pulled down.
  useHomeReload(load);

  const onOpen = React.useCallback(() => navigation.navigate(screenTimeRouteNames.home), [navigation]);

  if (!users.length) return null;

  // A day the child never used comes back at zero rather than missing, so there is nothing to show
  // only when neither day carries any usage. The screen says it differently, having a chart below
  // to carry the message.
  const hasData = (today?.totalDurationHours ?? 0) > 0 || (yesterday?.totalDurationHours ?? 0) > 0;

  const renderError = () => <WidgetMessage illustration="illu-error" text={I18n.get('widget-screen-time-error-text')} />;

  const renderPanelContent = () => {
    if (loading)
      return (
        <Placeholder Animation={Fade}>
          <ScreenTimeDurationPlaceholder />
        </Placeholder>
      );

    if (error)
      return <ScreenTimeMessage illustration="illu-error" text={I18n.get('widget-screen-time-error-text')} style={styles.empty} />;
    if (!hasData) return <ScreenTimeMessage text={I18n.get('widget-screen-time-no-data')} style={styles.empty} />;
    return <ScreenTimeDuration today={today} yesterday={yesterday} />;
  };

  const renderPanel = () => (
    <WidgetUserPanel
      background={theme.palette.complementary.yellow.pale}
      border={theme.palette.complementary.yellow.light}
      users={users}
      selectedId={selected?.id}
      onSelect={select}
      hasTabs={isRelative}
      actionTestID="screen-time-widget-children">
      {renderPanelContent()}
    </WidgetUserPanel>
  );

  const renderContent = () => {
    if (error && !isRelative) return renderError();
    return renderPanel();
  };

  return (
    <WidgetCard title={I18n.get('widget-screen-time-title')} onExpand={onOpen} expandTestID="screen-time-widget-open">
      {renderContent()}
    </WidgetCard>
  );
}
