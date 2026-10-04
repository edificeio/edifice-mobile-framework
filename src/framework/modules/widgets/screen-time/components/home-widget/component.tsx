import * as React from 'react';
import { View } from 'react-native';

import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { HeadingXSText, SmallText } from '~/framework/components/text';
import { AccountType, AuthActiveAccount } from '~/framework/modules/auth/model';
import { useHomeReload } from '~/framework/modules/home/hooks';
import { WidgetCard } from '~/framework/modules/widgets/components/card';
import { WidgetMessage } from '~/framework/modules/widgets/components/message';
import { WidgetUserPanel } from '~/framework/modules/widgets/components/user-panel';
import { useSelectedChild } from '~/framework/modules/widgets/hooks';
import { useScreenTimeSummary, useScreenTimeUsers } from '~/framework/modules/widgets/screen-time/hooks/screen-time';
import { screenTimeRouteNames } from '~/framework/modules/widgets/screen-time/navigation';
import { selectedChildStorage } from '~/framework/modules/widgets/screen-time/storage';

import { ScreenTimeWidgetPlaceholder } from './placeholder';
import styles from './styles';

function DayDuration({ label, value }: Readonly<{ label: string; value?: string }>) {
  return (
    <View style={styles.day}>
      <SmallText>{label}</SmallText>
      <HeadingXSText style={styles.duration} numberOfLines={1} adjustsFontSizeToFit>
        {value ?? I18n.get('widget-screen-time-zero-minutes')}
      </HeadingXSText>
    </View>
  );
}

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

  const hasData = (today?.totalDurationHours ?? 0) > 0 || (yesterday?.totalDurationHours ?? 0) > 0;

  const renderDurations = () => (
    <View style={styles.durations}>
      <DayDuration label={I18n.get('widget-screen-time-today')} value={today?.totalDurationString} />
      <DayDuration label={I18n.get('widget-screen-time-yesterday')} value={yesterday?.totalDurationString} />
    </View>
  );

  const renderEmpty = () => (
    <View style={[styles.durations, styles.empty]}>
      <SmallText style={styles.emptyText}>{I18n.get('widget-screen-time-no-data')}</SmallText>
    </View>
  );

  const renderLoaded = () => (
    <WidgetUserPanel
      background={theme.palette.complementary.yellow.pale}
      border={theme.palette.complementary.yellow.light}
      users={users}
      selectedId={selected?.id}
      onSelect={select}
      hasTabs={isRelative}
      actionTestID="screen-time-widget-children">
      {hasData ? renderDurations() : renderEmpty()}
    </WidgetUserPanel>
  );

  const renderContent = () => {
    if (loading) return <ScreenTimeWidgetPlaceholder hasTabs={isRelative} />;
    if (error) return <WidgetMessage illustration="illu-error" text={I18n.get('widget-screen-time-error-text')} />;
    return renderLoaded();
  };

  return (
    <WidgetCard title={I18n.get('widget-screen-time-title')} onExpand={onOpen} expandTestID="screen-time-widget-open">
      {renderContent()}
    </WidgetCard>
  );
}
