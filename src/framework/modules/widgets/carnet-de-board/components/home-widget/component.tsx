import * as React from 'react';
import { View } from 'react-native';

import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { AccountType } from '~/framework/modules/auth/model';
import { useHomeReload } from '~/framework/modules/home/hooks';
import { useCarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/hooks';
import { CarnetDeBordSection, hasPronoteData } from '~/framework/modules/widgets/carnet-de-board/model';
import { pronoteRouteNames } from '~/framework/modules/widgets/carnet-de-board/navigation';
import { WidgetCard } from '~/framework/modules/widgets/components/card';
import { WidgetMessage } from '~/framework/modules/widgets/components/message';
import { WidgetUserPanel } from '~/framework/modules/widgets/components/user-panel';
import { getChildId } from '~/framework/modules/widgets/model';

import { CarnetDeBordWidgetPlaceholder } from './placeholder';
import { CarnetDeBordWidgetSectionCard } from './section-card';
import { WIDGET_SECTIONS } from './sections';
import styles from './styles';
import { CarnetDeBordWidgetProps } from './types';

export function CarnetDeBordWidget({ session }: Readonly<CarnetDeBordWidgetProps>) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { children, error, load, loading, select, selected } = useCarnetDeBord();
  const isRelative = session.user.type === AccountType.Relative;

  // Loads on mount, then every time the home is opened again or pulled down.
  useHomeReload(load);

  const onOpen = React.useCallback(() => navigation.navigate(pronoteRouteNames.carnetDeBordModal), [navigation]);

  const openSection = React.useCallback(
    (section: CarnetDeBordSection) => {
      if (!selected) return;

      navigation.navigate(pronoteRouteNames.carnetDeBordModal, {
        params: { data: selected, type: section },
        screen: pronoteRouteNames.carnetDeBordDetails,
      });
    },
    [navigation, selected],
  );

  if (!loading && !error && !selected) return null;

  const hasPronote = !!selected && hasPronoteData(selected);

  const renderLoading = () => <CarnetDeBordWidgetPlaceholder hasTabs={isRelative} />;

  const renderError = () => <WidgetMessage illustration="illu-error" text={I18n.get('pronote-widget-error-text')} />;

  const renderEmptyChildContent = () => <WidgetMessage illustration="empty-timeline" text={I18n.get('pronote-nodatachild-text')} />;

  const renderSections = () => (
    <View style={styles.sections}>
      {WIDGET_SECTIONS.map(block => (
        <CarnetDeBordWidgetSectionCard
          key={block.section}
          colors={block.colors}
          icon={block.icon}
          title={I18n.get(block.titleI18n)}
          value={block.getValue(selected)}
          emptyText={I18n.get(block.emptyTextI18n)}
          section={block.section}
          onPress={openSection}
        />
      ))}
    </View>
  );

  const renderLoaded = () => {
    const panelColors = hasPronote
      ? { background: theme.palette.complementary.yellow.pale, border: theme.palette.complementary.yellow.light }
      : { background: theme.palette.grey.white, border: theme.palette.grey.cloudy };

    return (
      <WidgetUserPanel
        background={panelColors.background}
        border={panelColors.border}
        users={children}
        selectedId={selected && getChildId(selected)}
        onSelect={select}
        hasTabs={isRelative}
        actionTestID="carnet-de-bord-widget-children">
        {hasPronote && selected ? renderSections() : renderEmptyChildContent()}
      </WidgetUserPanel>
    );
  };

  const renderContent = () => {
    if (loading) return renderLoading();
    if (error) return renderError();
    return renderLoaded();
  };

  return (
    <WidgetCard title={I18n.get('pronote-widget-title')} onExpand={onOpen} expandTestID="carnet-de-bord-widget-open">
      {renderContent()}
    </WidgetCard>
  );
}
