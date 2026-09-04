import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import theme from '~/app/theme';
import { WIDGET_SECTIONS } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/sections';
import styles from '~/framework/modules/widgets/carnet-de-board/components/home-widget/styles';
import { CarnetDeBordWidgetPlaceholderProps } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/types';
import { TabbedPanel } from '~/framework/modules/widgets/components/tabbed-panel';
import { WidgetUserSelectorPlaceholder } from '~/framework/modules/widgets/components/user-selector';

export function CarnetDeBordWidgetPlaceholder({ tabs }: CarnetDeBordWidgetPlaceholderProps) {
  return (
    <Placeholder Animation={Fade}>
      <TabbedPanel
        style={styles.body}
        background={theme.palette.grey.pearl}
        border={theme.palette.grey.cloudy}
        header={tabs ? <WidgetUserSelectorPlaceholder /> : undefined}>
        <View style={styles.sections}>
          {WIDGET_SECTIONS.map(block => (
            <View key={block.section} style={[styles.sectionCard, styles.placeholderCard]}>
              <PlaceholderMedia style={[styles.icon, styles.placeholderIcon]} />
              <View style={[styles.sectionCardText, styles.placeholderLines]}>
                <PlaceholderLine width={40} noMargin />
                <PlaceholderLine width={70} noMargin />
              </View>
            </View>
          ))}
        </View>
      </TabbedPanel>
    </Placeholder>
  );
}
