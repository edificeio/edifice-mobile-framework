import * as React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { SelectButtonProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import BottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';
import { Svg } from '~/framework/components/picture';
import { BodyText } from '~/framework/components/text';

const SelectButton = <T,>(props: SelectButtonProps<T>) => {
  const {
    action,
    borderless = true,
    data,
    iconLeft,
    iconRight,
    keyExtractor,
    ListComponent = FlatList,
    ListEmptyComponent,
    ListFooterComponent,
    ListHeaderComponent,
    onItemPress,
    refreshControl,
    renderItem,
    testID,
    text,
    wrapperStyle,
  } = props;

  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);

  const renderIcon = (iconName: string | undefined, size: number = UI_SIZES.elements.icon.small) => {
    if (!iconName) return null;
    return <Svg name={iconName} width={size} height={size} fill={theme.palette.grey.graphite} />;
  };

  const handleButtonPress = React.useCallback(() => {
    if (action) {
      action();
    } else if (data && data.length > 0) {
      bottomSheetRef.current?.present();
    }
  }, [action, data]);

  const handleItemPress = React.useCallback(
    (item: T) => {
      onItemPress?.(item);
      bottomSheetRef.current?.dismiss();
    },
    [onItemPress],
  );

  const hideBottomSheet = React.useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const listContainerStyle = React.useMemo(() => {
    return borderless ? styles.bottomSheetListContainer : styles.listContainer;
  }, [borderless]);

  const defaultKeyExtractor = React.useCallback(
    (item: T, index: number) => {
      if (keyExtractor) {
        return keyExtractor(item, index);
      }
      // Fallback to index if no keyExtractor provided
      return index.toString();
    },
    [keyExtractor],
  );

  const defaultRenderItem = React.useCallback(
    ({ item }: { item: T }) => {
      if (renderItem) {
        return renderItem({ item, onPress: () => handleItemPress(item) });
      }
      // Default render for simple string/number items
      return (
        <TouchableOpacity onPress={() => handleItemPress(item)} style={styles.defaultListItem}>
          <BodyText numberOfLines={1} style={styles.defaultListItemText}>
            {String(item)}
          </BodyText>
        </TouchableOpacity>
      );
    },
    [renderItem, handleItemPress],
  );

  return (
    <>
      <TouchableOpacity onPress={handleButtonPress} {...(testID && { testID })}>
        <View style={[wrapperStyle, styles.buttonContainer]}>
          <View style={styles.leftContent}>
            {renderIcon(iconLeft)}
            <BodyText numberOfLines={1} style={iconLeft ? styles.text : styles.textNoIcon}>
              {text}
            </BodyText>
          </View>
          {renderIcon(iconRight)}
        </View>
      </TouchableOpacity>

      {data && data.length > 0 && (
        <BottomSheetModal ref={bottomSheetRef} onDismiss={hideBottomSheet} style={false}>
          <ListComponent
            contentContainerStyle={listContainerStyle}
            data={data}
            ItemSeparatorComponent={() => <View style={styles.spacingItem} />}
            ListFooterComponent={ListFooterComponent}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={ListEmptyComponent}
            refreshControl={refreshControl}
            renderItem={defaultRenderItem}
            keyExtractor={defaultKeyExtractor}
          />
        </BottomSheetModal>
      )}
    </>
  );
};

export default SelectButton;
