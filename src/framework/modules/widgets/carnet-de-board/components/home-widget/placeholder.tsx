import * as React from 'react';
import { View } from 'react-native';

import { Fade, Placeholder, PlaceholderLine, PlaceholderMedia } from 'rn-placeholder';

import { WidgetPlaceholderProps } from '~/framework/modules/widgets/components/types';
import { WidgetUserPanelPlaceholder } from '~/framework/modules/widgets/components/user-panel';

import { WIDGET_SECTIONS } from './sections';
import styles from './styles';

const PLACEHOLDER_CARD_STYLE = [styles.sectionCard, styles.placeholderCard];
const PLACEHOLDER_ICON_STYLE = [styles.icon, styles.placeholderIcon];
const PLACEHOLDER_LINES_STYLE = [styles.sectionCardText, styles.placeholderLines];

export function CarnetDeBordWidgetPlaceholder({ hasTabs }: Readonly<WidgetPlaceholderProps>) {
  return (
    <Placeholder Animation={Fade}>
      <WidgetUserPanelPlaceholder hasTabs={hasTabs}>
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
      </WidgetUserPanelPlaceholder>
    </Placeholder>
  );
}
