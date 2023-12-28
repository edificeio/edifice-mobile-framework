import { Picker } from '@react-native-picker/picker';
import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallActionText, SmallText } from '~/framework/components/text';
import { ModalBox, ModalContent } from '~/ui/Modal';

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
    gap: UI_SIZES.spacing.large,
    marginBottom: UI_SIZES.spacing.large,
  },
  container: {
    borderRadius: UI_SIZES.radius.medium,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    minHeight: 50,
    backgroundColor: theme.ui.background.card,
  },
  androidPickerColor: {
    color: theme.ui.text.regular,
  },
  rowContainer: {
    paddingVertical: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: {
    color: theme.ui.text.regular,
  },
  modalContent: {
    width: 350,
  },
  dropdownPicker: {
    width: '100%',
    marginBottom: UI_SIZES.spacing.large,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
});

interface IDropdownProps {
  data: any[];
  value?: string;
  onSelect: (item: string) => void;
  keyExtractor?: (item: any) => string;
  renderItem?: (item: any) => string;
}

const DropdownAndroid = ({
  data,
  value,
  onSelect,
  keyExtractor = item => item.toString(),
  renderItem = item => item.toString(),
}: IDropdownProps) => {
  return (
    <View style={styles.container}>
      <Picker selectedValue={value} onValueChange={(itemValue, itemIndex) => onSelect(itemValue)} style={styles.androidPickerColor}>
        {data.map(item => (
          <Picker.Item label={renderItem(item)} value={keyExtractor(item)} />
        ))}
      </Picker>
    </View>
  );
};

const DropdownIOS = ({
  data,
  value,
  onSelect,
  keyExtractor = item => item.toString(),
  renderItem = item => item.toString(),
}: IDropdownProps) => {
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [tempValue, setTempValue] = React.useState<string | undefined>(value ?? keyExtractor(data[0]));
  const selectedValue = data.find(item => keyExtractor(item) === value);

  return (
    <>
      <TouchableOpacity style={[styles.container, styles.rowContainer]} onPress={() => setModalVisible(true)}>
        <SmallText style={styles.valueText} numberOfLines={1}>
          {renderItem(selectedValue)}
        </SmallText>
        <NamedSVG name="ui-rafterDown" width={20} height={20} fill={theme.ui.text.regular} />
      </TouchableOpacity>
      <ModalBox isVisible={isModalVisible} onDismiss={() => setModalVisible(false)}>
        <ModalContent style={styles.modalContent}>
          <View style={styles.dropdownPicker}>
            <Picker selectedValue={tempValue} onValueChange={(itemValue, itemIndex) => setTempValue(itemValue)}>
              {data.map(item => (
                <Picker.Item label={renderItem(item)} value={keyExtractor(item)} />
              ))}
            </Picker>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <SmallActionText>{I18n.get('common-cancel')}</SmallActionText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                onSelect(tempValue!);
              }}>
              <SmallActionText>{I18n.get('common-ok')}</SmallActionText>
            </TouchableOpacity>
          </View>
        </ModalContent>
      </ModalBox>
    </>
  );
};

export default (props: IDropdownProps) => {
  return Platform.OS === 'ios' ? <DropdownIOS {...props} /> : <DropdownAndroid {...props} />;
};
