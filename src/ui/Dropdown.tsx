import { Picker } from '@react-native-picker/picker';
import I18n from 'i18n-js';
import * as React from 'react';
import { useState } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

import { TextBold } from '~/framework/components/text';
import { CommonStyles } from '~/styles/common/styles';
import { ButtonsOkCancel } from '~/ui/ButtonsOkCancel';
import { Icon } from '~/ui/icons/Icon';

import { ModalBox, ModalContent, ModalContentBlock, ModalContentText } from './Modal';

/* STYLE */

const styles = StyleSheet.create({
  fullView: {
    flex: 1,
  },
  dropdownButton: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalContent: {
    width: 350,
  },
  dropdownPicker: {
    width: '100%',
    marginBottom: 35,
    paddingHorizontal: 20,
  },
});

/* COMPONENT */
interface IDropdownProps {
  keyId?: string;
  style?: ViewStyle;
  value?: string;
  data: any[];
  onSelect: (item: string) => void;
  renderItem?: (item: any) => string;
  keyExtractor?: (item: any) => string;
  placeholder?: string;
  title?: string;
}

const selectedStyle = {
  borderRadius: 5,
  borderColor: CommonStyles.grey,
  borderWidth: 2,
  borderStyle: 'solid',
  backgroundColor: 'white',
} as ViewStyle;

const DropdownAndroid = ({ title, style, data, value, onSelect, renderItem, keyExtractor }: IDropdownProps) => {
  const getItemRenderer = renderItem ? renderItem : item => item.toString();
  const getItemKeyExtractor = keyExtractor ? keyExtractor : item => item.toString();

  return (
    <View style={[selectedStyle, styles.fullView, style]}>
      <Picker
        style={{
          color: CommonStyles.textColor,
        }}
        prompt={title}
        selectedValue={value}
        onValueChange={(key, value) => onSelect(key as string)}>
        {data.map(item => (
          <Picker.Item label={getItemRenderer(item)} value={getItemKeyExtractor(item)} />
        ))}
      </Picker>
    </View>
  );
};

const DropdownIOS = ({ keyId, title, renderItem, keyExtractor, style, data, placeholder, value, onSelect }: IDropdownProps) => {
  const getItemRenderer = renderItem ? renderItem : item => item.toString();
  const getItemKeyExtractor = keyExtractor ? keyExtractor : item => item.toString();

  const [visible, toggleModal] = useState(false);
  const [selected, selectValue] = useState(value);
  if (value !== selected && !visible && keyId === 'competences.periods') {
    selectValue(value);
  }

  return (
    <View style={styles.fullView}>
      <TouchableWithoutFeedback style={[selectedStyle, styles.dropdownButton, style]} onPress={() => toggleModal(true)}>
        <TextBold style={styles.fullView} numberOfLines={1}>
          {placeholder ? placeholder : value ? getItemRenderer(data.find(item => getItemKeyExtractor(item) === value)) : ' '}
        </TextBold>
        <Icon size={20} name="arrow_down" />
      </TouchableWithoutFeedback>
      <ModalBox isVisible={visible} onDismiss={() => toggleModal(false)}>
        <ModalContent style={styles.modalContent}>
          {!!title && (
            <ModalContentBlock>
              <ModalContentText>{title}</ModalContentText>
            </ModalContentBlock>
          )}
          <View style={styles.dropdownPicker}>
            <Picker selectedValue={selected} onValueChange={(value, label) => selectValue(value as string)}>
              {data.map(item => (
                <Picker.Item label={getItemRenderer(item)} value={getItemKeyExtractor(item)} />
              ))}
            </Picker>
          </View>
          <ModalContentBlock>
            <ButtonsOkCancel
              onCancel={() => {
                toggleModal(false);
              }}
              onValid={() => {
                toggleModal(false);
                onSelect(selected!);
              }}
              title={I18n.t('common-ok')}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    </View>
  );
};

export default (props: IDropdownProps) => {
  switch (Platform.OS) {
    case 'ios': {
      return <DropdownIOS {...props} />;
    }
    default: {
      return <DropdownAndroid {...props} />;
    }
  }
};
