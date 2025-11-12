import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { I18n } from '~/app/i18n';
import { UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyBoldText } from '~/framework/components/text';
import styles from '~/framework/modules/timeline/components/widget-chip/styles';
import { IWidgetChipProps, IWidgetChipsContainerProps } from '~/framework/modules/timeline/components/widget-chip/types';
import { Image } from '~/framework/util/media-deprecated';
import { AnyNavigableModule } from '~/framework/util/moduleTool';

function WidgetChipItem(props: IWidgetChipProps) {
  const { onPress, testID, widget } = props;
  const label = I18n.get(widget.config.displayI18n);

  const renderPicture = () => {
    switch (widget.config.displayPicture?.type) {
      case 'Svg':
        return (
          <Svg {...widget.config.displayPicture} height={UI_SIZES.elements.icon.xlarge} width={UI_SIZES.elements.icon.xlarge} />
        );
      case 'Image':
        return <Image source={widget.config.displayPicture.source} style={styles.imagePicture} />;
      default:
        return null;
    }
  };

  return (
    <Pressable onPress={onPress} style={styles.chipButton} testID={testID}>
      {renderPicture()}
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
