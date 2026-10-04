import * as React from 'react';
import { StyleSheet } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { WidgetPanel } from '~/framework/modules/widgets/components/panel';
import { WidgetUserSelector, WidgetUserSelectorPlaceholder } from '~/framework/modules/widgets/components/user-selector';

import { WidgetUserPanelPlaceholderProps, WidgetUserPanelProps } from './types';

const RING_COLOR = theme.palette.complementary.yellow.regular;

const OTHER_USERS_ICON = 'ui-users' as const;

export function WidgetUserPanel({
  actionTestID,
  background,
  border,
  children,
  hasTabs,
  onSelect,
  selectedId,
  users,
}: Readonly<WidgetUserPanelProps>) {
  const action = React.useMemo(() => ({ icon: OTHER_USERS_ICON, testID: actionTestID }), [actionTestID]);

  const header =
    hasTabs && users.length ? (
      <WidgetUserSelector items={users} selectedId={selectedId} onSelect={onSelect} action={action} ringColor={RING_COLOR} />
    ) : null;

  return (
    <WidgetPanel style={styles.root} background={background} border={border} header={header}>
      {children}
    </WidgetPanel>
  );
}

export function WidgetUserPanelPlaceholder({ children, hasTabs }: Readonly<WidgetUserPanelPlaceholderProps>) {
  return (
    <WidgetPanel
      style={styles.root}
      background={theme.palette.grey.pearl}
      border={theme.palette.grey.cloudy}
      header={hasTabs ? <WidgetUserSelectorPlaceholder /> : undefined}>
      {children}
    </WidgetPanel>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: UI_SIZES.radius.mediumPlus,
  },
});
