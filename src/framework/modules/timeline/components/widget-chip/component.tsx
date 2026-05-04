import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { CaptionBoldText, SmallBoldText } from '~/framework/components/text';
import styles from '~/framework/modules/timeline/components/widget-chip/styles';
import { IWidgetChipProps, IWidgetChipsContainerProps } from '~/framework/modules/timeline/components/widget-chip/types';
import { AnyNavigableModule, IEntcoreWidget } from '~/framework/util/moduleTool';

function WidgetChipItem(props: IWidgetChipProps) {
  const { entcoreWidget, onPress, testID, widget } = props;
  const label = entcoreWidget ? I18n.get(`myapps-app-${entcoreWidget.name}`) : widget.config.name;
  return (
    <Pressable onPress={onPress} style={styles.chipButton} testID={testID}>
      <SmallBoldText style={styles.chipsText}>{label}</SmallBoldText>
    </Pressable>
  );
}

const getMatchingWidget = (widget: AnyNavigableModule, entcoreWidgetsByName: Map<string, IEntcoreWidget>) => {
  return widget.config.entcoreWidgetName ? entcoreWidgetsByName.get(widget.config.entcoreWidgetName) : undefined;
};

function isContainerProps(props: IWidgetChipProps | IWidgetChipsContainerProps): props is IWidgetChipsContainerProps {
  return 'widgets' in props && 'navigation' in props;
}

export function WidgetChip(props: IWidgetChipProps | IWidgetChipsContainerProps): React.ReactElement {
  const isContainer = isContainerProps(props);
  const containerProps = isContainer ? props : null;

  const entcoreWidgetsByName = React.useMemo(() => {
    const map = new Map<string, IEntcoreWidget>();
    if (!containerProps) return map;

    for (const entcoreWidget of containerProps.entcoreWidgets) {
      map.set(entcoreWidget.name, entcoreWidget);
    }
    return map;
  }, [containerProps]);

  if (isContainer) {
    const { navigation, widgets } = props;

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
            const matchingEntcoreWidget = getMatchingWidget(widget, entcoreWidgetsByName);
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
