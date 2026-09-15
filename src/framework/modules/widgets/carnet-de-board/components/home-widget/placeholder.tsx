import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import theme from '~/app/theme';
import { WIDGET_SECTIONS } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/sections';
import styles from '~/framework/modules/widgets/carnet-de-board/components/home-widget/styles';
import { CarnetDeBordWidgetPlaceholderProps } from '~/framework/modules/widgets/carnet-de-board/components/home-widget/types';
import { Panel } from '~/framework/modules/widgets/components/panel';
import { WidgetUserSelectorPlaceholder } from '~/framework/modules/widgets/components/user-selector';

const PLACEHOLDER_CARD_STYLE = [styles.sectionCard, styles.placeholderCard];
const PLACEHOLDER_ICON_STYLE = [styles.icon, styles.placeholderIcon];
const PLACEHOLDER_LINES_STYLE = [styles.sectionCardText, styles.placeholderLines];

export function CarnetDeBordWidgetPlaceholder({ tabs }: Readonly<CarnetDeBordWidgetPlaceholderProps>) {
  return (
    <Placeholder Animation={Fade}>
      <Panel
        style={styles.body}
        background={theme.palette.grey.pearl}
        border={theme.palette.grey.cloudy}
        header={tabs ? <WidgetUserSelectorPlaceholder /> : undefined}>
        <View style={styles.sections}>
          {WIDGET_SECTIONS.map(block => (
            <View key={block.section} style={PLACEHOLDER_CARD_STYLE}>
              <PlaceholderMedia style={PLACEHOLDER_ICON_STYLE} />
              <View style={PLACEHOLDER_LINES_STYLE}>
                <PlaceholderLine width={40} noMargin />
                <PlaceholderLine width={70} noMargin />
              </View>
            </View>
          ))}
        </View>
      </Panel>
    </Placeholder>
  );
}
