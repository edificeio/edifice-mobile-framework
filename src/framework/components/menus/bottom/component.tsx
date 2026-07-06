import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// import BottomSheet from 'react-native-bottomsheet';

import { I18n } from '~/app/i18n';
import { TerciaryButton } from '~/framework/components/button';
import { UI_SIZES } from '~/framework/components/constants';
import { MenuAction } from '~/framework/components/menus/actions';
import { MenuProps } from '~/framework/components/menus/types/types';
import CustomBottomSheetModal, { BottomSheetModalMethods } from '~/framework/components/modals/bottom-sheet';

const styles = StyleSheet.create({
  bottomSheet: { alignItems: 'flex-start', paddingTop: UI_SIZES.spacing.minor },
});

const BottomMenu = (props: React.PropsWithChildren<MenuProps & { title?: string }>) => {
  const actions = props.actions;

  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null);
  const [bottomSheetItems, setBottomSheetItems] = React.useState<MenuAction[]>([]);

  const showBottomMenu = () => {
    actions.push({
      action: () => {},
      title: I18n.get('common-cancel'),
    });
    setBottomSheetItems(actions);
    bottomSheetRef.current?.present();
  };

  return (
    <>
      <CustomBottomSheetModal ref={bottomSheetRef}>
        <View style={styles.bottomSheet}>
          {bottomSheetItems.map(action => (
            <TerciaryButton
              text={action.title}
              onPress={() => {
                action.action();
                bottomSheetRef.current?.dismiss();
              }}
              disabled={action.disabled}
              testID={action.testID ?? 'button'}
              key={action.title}
            />
          ))}
        </View>
      </CustomBottomSheetModal>
      <TouchableOpacity onPress={showBottomMenu}>{props.children}</TouchableOpacity>
    </>
  );
};

export default BottomMenu;
