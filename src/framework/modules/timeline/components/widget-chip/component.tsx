import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';
import styles from '~/framework/modules/timeline/components/widget-chip/styles';
import { IWidgetChipProps, IWidgetChipsContainerProps } from '~/framework/modules/timeline/components/widget-chip/types';
import { AnyNavigableModule } from '~/framework/util/moduleTool';

function WidgetChipItem(props: IWidgetChipProps) {
  const { onPress, testID, widget } = props;
  const icon = widget.config.displayPicture?.type === 'Svg' ? widget.config.displayPicture.name : undefined;
  const label = I18n.get(widget.config.displayI18n);

  return (
    <Pressable onPress={onPress} style={styles.chipButton} testID={testID}>
      {icon && <Svg name={icon} width={16} height={16} fill={theme.palette.grey.graphite} />}
      <BodyBoldText style={styles.chipsText}>{label}</BodyBoldText>
    </Pressable>
  );
}

export function WidgetChip(props: IWidgetChipProps | IWidgetChipsContainerProps): React.ReactElement {
  // Check if this is a container props (has widgets and navigation)
  if ('widgets' in props && 'navigation' in props) {
    const { navigation, widgets } = props as IWidgetChipsContainerProps;

    return (
      <View style={styles.chipsContainer}>
        <FlatList
          data={widgets}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          keyExtractor={(item: AnyNavigableModule) => item.config.name}
          renderItem={({ item: widget }: { item: AnyNavigableModule }) => (
            <WidgetChipItem
              widget={widget}
              onPress={() => navigation.navigate(widget.config.routeName as never)}
              testID={`timeline-chip-${widget.config.name}`}
            />
          )}
        />
      </View>
    );
  }

  // Otherwise, render as a single chip
  return <WidgetChipItem {...(props as IWidgetChipProps)} />;
}
