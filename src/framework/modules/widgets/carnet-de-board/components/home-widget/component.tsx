import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { getScaleImageSize } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { AccountType } from '~/framework/modules/auth/model';
import { CarnetDeBordWidgetSectionCard } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/section-card';
import { WIDGET_SECTIONS } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/sections';
import styles from '~/framework/modules/widgets/carnet-de-board/components/home-widget/styles';
import { CarnetDeBordWidgetProps } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/types';
import { useCarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/hooks';
import { CarnetDeBordSection, hasPronoteData } from '~/framework/modules/widgets/carnet-de-board/model';
import { WidgetCard } from '~/framework/modules/widgets/components/card';
import { Panel } from '~/framework/modules/widgets/components/panel';
import { WidgetUserSelector } from '~/framework/modules/widgets/components/user-selector';

import { CarnetDeBordWidgetPlaceholder } from './placeholder';

const EMPTY_ILLUSTRATION_SIZE = getScaleImageSize(96);

const OTHER_CHILDREN_ACTION = { icon: 'ui-users' as const, testID: 'carnet-de-bord-widget-children' };

function Message({ illustration, text }: Readonly<{ illustration: SvgIconName; text: string }>) {
  return (
    <View style={styles.empty}>
      <Svg name={illustration} width={EMPTY_ILLUSTRATION_SIZE} height={EMPTY_ILLUSTRATION_SIZE} />
      <SmallText style={styles.emptyText}>{text}</SmallText>
    </View>
  );
}

export function CarnetDeBordWidget({ loading, onOpen, onOpenSection, session }: Readonly<CarnetDeBordWidgetProps>) {
  const { children, error, select, selected, selectedId } = useCarnetDeBord();
  const isRelative = session.user.type === AccountType.Relative;

  const openSection = React.useCallback(
    (section: CarnetDeBordSection) => {
      if (selected) onOpenSection(section, selected);
    },
    [onOpenSection, selected],
  );

  if (!loading && !error && !selected) return null;

  const hasPronote = !!selected && hasPronoteData(selected);

  const renderLoading = () => <CarnetDeBordWidgetPlaceholder tabs={isRelative} />;

  const renderError = () => <Message illustration="illu-error" text={I18n.get('pronote-widget-error-text')} />;

  const renderEmptyChildContent = () => <Message illustration="empty-timeline" text={I18n.get('pronote-nodatachild-text')} />;

  const renderSections = () => (
    <View style={styles.sections}>
      {WIDGET_SECTIONS.map(block => (
        <CarnetDeBordWidgetSectionCard
          key={block.section}
          colors={block.colors}
          icon={block.icon}
          title={I18n.get(block.title)}
          value={block.getValue(selected)}
          emptyText={I18n.get(block.emptyText)}
          section={block.section}
          onPress={openSection}
        />
      ))}
    </View>
  );

  const renderLoaded = () => {
    const panel = hasPronote
      ? { background: theme.palette.complementary.yellow.pale, border: theme.palette.complementary.yellow.light }
      : { background: theme.palette.grey.white, border: theme.palette.grey.cloudy };

    // A pupil is alone in his own dashboard: no tabs at all, and the panel is then a plain rounded
    // rectangle. A parent keeps his row, one tab even for an only child.
    const selector =
      isRelative && children.length ? (
        <WidgetUserSelector
          items={children}
          selectedId={selectedId}
          onSelect={select}
          action={OTHER_CHILDREN_ACTION}
          ringColor={theme.palette.complementary.yellow.regular}
        />
      ) : null;

    return (
      <Panel style={styles.body} background={panel.background} border={panel.border} header={selector}>
        {hasPronote && selected ? renderSections() : renderEmptyChildContent()}
      </Panel>
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
