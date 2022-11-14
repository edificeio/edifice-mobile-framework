import { Picker } from '@react-native-picker/picker';
import I18n from 'i18n-js';
import * as React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';
import { ButtonsOkCancel } from '~/ui/ButtonsOkCancel';

import { ModalBox, ModalContent, ModalContentBlock, ModalContentText } from './Modal';

const styles = StyleSheet.create({
  container: {
    borderRadius: UI_SIZES.radius.medium,
    borderColor: theme.palette.primary.regular,
    borderWidth: 1,
    minHeight: 50,
    backgroundColor: theme.ui.background.card,
  },
  androidPickerColor: {
    color: theme.ui.text.light,
  },
  rowContainer: {
    paddingVertical: UI_SIZES.spacing.tiny,
    paddingHorizontal: UI_SIZES.spacing.small,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueText: {
    color: theme.ui.text.light,
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
  keyId?: string;
  placeholder?: string;
  showPlaceholderItem?: boolean;
  style?: ViewStyle;
  title?: string;
  value?: string;
  onSelect: (item: string) => void;
  keyExtractor?: (item: any) => string;
  renderItem?: (item: any) => string;
}

const DropdownAndroid = ({
  data,
  placeholder,
  showPlaceholderItem,
  style,
  title,
  value,
  onSelect,
  keyExtractor = item => item.toString(),
  renderItem = item => item.toString(),
}: IDropdownProps) => {
  return (
    <View style={[styles.container, style]}>
      <Picker
        selectedValue={value}
        onValueChange={(itemValue, itemIndex) => onSelect(itemValue)}
        prompt={title}
        style={styles.androidPickerColor}>
        {showPlaceholderItem ? <Picker.Item label={placeholder} /> : null}
        {data.map(item => (
          <Picker.Item label={renderItem(item)} value={keyExtractor(item)} />
        ))}
      </Picker>
    </View>
  );
};

const DropdownIOS = ({
  data,
  keyId,
  placeholder,
  style,
  title,
  value,
  onSelect,
  keyExtractor = item => item.toString(),
  renderItem = item => item.toString(),
}: IDropdownProps) => {
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [tempValue, setTempValue] = React.useState(value);
  const selectedValue = data.find(item => keyExtractor(item) === value);

  if (value !== tempValue && !isModalVisible && keyId === 'competences.periods') {
    setTempValue(value);
  }

  return (
    <>
      <TouchableOpacity style={[styles.container, styles.rowContainer, style]} onPress={() => setModalVisible(true)}>
        <SmallText style={styles.valueText} numberOfLines={1}>
          {selectedValue ? renderItem(selectedValue) : placeholder}
        </SmallText>
        <Picture type="NamedSvg" name="ui-rafterDown" width={20} height={20} fill={theme.ui.text.light} />
      </TouchableOpacity>
      <ModalBox isVisible={isModalVisible} onDismiss={() => setModalVisible(false)}>
        <ModalContent style={styles.modalContent}>
          {title ? (
            <ModalContentBlock>
              <ModalContentText>{title}</ModalContentText>
            </ModalContentBlock>
          ) : null}
          <View style={styles.dropdownPicker}>
            <Picker selectedValue={tempValue} onValueChange={(itemValue, itemIndex) => setTempValue(itemValue)}>
              {data.map(item => (
                <Picker.Item label={renderItem(item)} value={keyExtractor(item)} />
              ))}
            </Picker>
          </View>
          <ModalContentBlock>
            <ButtonsOkCancel
              onCancel={() => {
                setModalVisible(false);
              }}
              onValid={() => {
                setModalVisible(false);
                onSelect(tempValue!);
              }}
              title={I18n.t('common-ok')}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    </>
  );
};

export default (props: IDropdownProps) => {
  return Platform.OS === 'ios' ? <DropdownIOS {...props} /> : <DropdownAndroid {...props} />;
};
