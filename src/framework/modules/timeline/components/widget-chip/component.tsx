import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { CaptionBoldText, SmallBoldText } from '~/framework/components/text';
import { toKebabCase } from '~/framework/modules/myapps/utils';
import styles from '~/framework/modules/timeline/components/widget-chip/styles';
import { IWidgetChipProps, IWidgetChipsContainerProps } from '~/framework/modules/timeline/components/widget-chip/types';
import { getWidgetTitle } from '~/framework/modules/timeline/utils/widget-title';
import { AnyNavigableModule, IEntcoreWidget } from '~/framework/util/moduleTool';

function WidgetChipItem(props: IWidgetChipProps) {
  const { entcoreWidget, onPress, testID, widget } = props;
  const label = entcoreWidget ? getWidgetTitle(entcoreWidget) : widget.config.name;
  return (
    <Pressable onPress={onPress} style={styles.chipButton} testID={testID}>
      <SmallBoldText style={styles.chipsText}>{label}</SmallBoldText>
    </Pressable>
  );
}

export function WidgetChip(props: IWidgetChipProps | IWidgetChipsContainerProps): React.ReactElement {
  // Check if this is a container props (has widgets and navigation)
  if ('widgets' in props && 'navigation' in props) {
    const { entcoreWidgets, navigation, widgets } = props as IWidgetChipsContainerProps;
    const entcoreWidgetMap = new Map<string, IEntcoreWidget>(entcoreWidgets.map(w => [w.name, w]));

    return (
      <View style={styles.chipsContainer}>
        <CaptionBoldText style={styles.chipsTitle}>{I18n.get('timeline-widget-chip-title')}</CaptionBoldText>
        <FlatList
          data={widgets}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          keyExtractor={(item: AnyNavigableModule) => item.config.name}
          renderItem={({ item: widget }: { item: AnyNavigableModule }) => {
            // converting module name to kebab-case and adding "-widget" suffix to match api names
            const kebabName = toKebabCase(widget.config.name);
            const entcoreWidgetName = `${kebabName}-widget`;
            const matchingEntcoreWidget = entcoreWidgetMap.get(entcoreWidgetName);
            return (
              <WidgetChipItem
                widget={widget}
                entcoreWidget={matchingEntcoreWidget}
                onPress={() => navigation.navigate(widget.config.routeName as never)}
                testID={`timeline-chip-${widget.config.name}`}
              />
            );
          }}
        />
      </View>
    );
  }

  // Otherwise, render as a single chip
  return <WidgetChipItem {...(props as IWidgetChipProps)} />;
}
