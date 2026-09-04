import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { getScaleImageSize } from '~/framework/components/constants';
import { Svg, SvgIconName } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { WIDGET_EMPTY_IMAGE_SIZE } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/constants';
import { CarnetDeBordSectionCard } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/section-card';
import { WIDGET_SECTIONS } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/sections';
import styles from '~/framework/modules/widgets/carnet-de-board/components/home-widget/styles';
import { CarnetDeBordWidgetProps } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/types';
import { useCarnetDeBord } from '~/framework/modules/widgets/carnet-de-board/hooks/use-carnet-de-bord';
import { CarnetDeBordSection } from '~/framework/modules/widgets/carnet-de-board/model/carnet-de-bord';
import { WidgetCard } from '~/framework/modules/widgets/components/card';
import { TabbedPanel } from '~/framework/modules/widgets/components/tabbed-panel';
import { WidgetUserSelector } from '~/framework/modules/widgets/components/user-selector';

function Message({ illustration, text }: { illustration: SvgIconName; text: string }) {
  return (
    <View style={styles.empty}>
      <Svg
        name={illustration}
        width={getScaleImageSize(WIDGET_EMPTY_IMAGE_SIZE)}
        height={getScaleImageSize(WIDGET_EMPTY_IMAGE_SIZE)}
      />
      <SmallText style={styles.emptyText}>{text}</SmallText>
    </View>
  );
}

export function CarnetDeBordWidget({ onOpen, onOpenSection }: CarnetDeBordWidgetProps) {
  const { children, error, load, select, selected, selectedId } = useCarnetDeBord();

  React.useEffect(() => {
    load();
  }, [load]);

  const openSection = React.useCallback(
    (section: CarnetDeBordSection) => {
      if (selected) onOpenSection(section, selected);
    },
    [onOpenSection, selected],
  );

  const otherChildrenAction = React.useMemo(() => ({ icon: 'ui-users' as const, testID: 'carnet-de-bord-widget-children' }), []);

  if (error)
    return (
      <WidgetCard title={I18n.get('pronote-widget-title')} onExpand={onOpen} expandTestID="carnet-de-bord-widget-open">
        <Message illustration="illu-error" text={I18n.get('pronote-widget-error-text')} />
      </WidgetCard>
    );

  if (!selected) return null;

  // structureId is left out on purpose: it only names the structure, and the API does not always
  // send it, which would hide a child who has data.
  const hasPronote = !!(selected.idPronote && selected.address);

  const panel = hasPronote
    ? { background: theme.palette.complementary.yellow.pale, border: theme.palette.complementary.yellow.light }
    : { background: theme.palette.grey.white, border: theme.palette.grey.cloudy };

  // A single child needs no row of tabs, and the panel is then a plain rounded rectangle.
  const selector =
    children.length > 1 ? (
      <WidgetUserSelector
        items={children}
        selectedId={selectedId}
        onSelect={select}
        action={otherChildrenAction}
        ringColor={theme.palette.complementary.yellow.regular}
      />
    ) : null;

  return (
    <WidgetCard title={I18n.get('pronote-widget-title')} onExpand={onOpen} expandTestID="carnet-de-bord-widget-open">
      <TabbedPanel style={styles.body} background={panel.background} border={panel.border} header={selector}>
        {hasPronote ? (
          <View style={styles.sections}>
            {WIDGET_SECTIONS.map(block => (
              <CarnetDeBordSectionCard
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
        ) : (
          <Message illustration="empty-timeline" text={I18n.get('pronote-nodatachild-text')} />
        )}
      </TabbedPanel>
    </WidgetCard>
  );
}
