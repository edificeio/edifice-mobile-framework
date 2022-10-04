import DateTimePicker from '@react-native-community/datetimepicker';
import I18n from 'i18n-js';
import moment from 'moment';
import React, { useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallText } from '~/framework/components/text';
import { viescoTheme } from '~/modules/viescolaire/dashboard/utils/viescoTheme';
import { ButtonsOkCancel } from '~/ui/ButtonsOkCancel';

import { ModalBox, ModalContent, ModalContentBlock } from './Modal';

const styles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: UI_SIZES.spacing.minor,
    backgroundColor: theme.ui.background.card,
    borderRadius: 5,
  },
  text: {
    marginLeft: UI_SIZES.spacing.tiny,
  },
  modalContentContainer: {
    width: 350,
  },
  pickerContainer: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: UI_SIZES.spacing.medium,
    marginBottom: UI_SIZES.spacing.large,
    alignItems: 'center',
  },
  textPicker: {
    justifyContent: 'flex-end',
    width: '60%',
  },
  iosPickerContainer: {
    justifyContent: 'flex-start',
    width: '40%',
  },
});

interface IDateTimeButtonProps {
  color: string;
  text: string;
  style?: ViewStyle;
  onPress: () => void;
}

type IDateTimePickerProps = {
  mode: 'time' | 'date';
  onChange: any;
  value: moment.Moment;
  color?: string;
  maximumDate?: moment.Moment;
  minimumDate?: moment.Moment;
  style?: ViewStyle;
  renderDate?: (time: moment.Moment) => React.ReactElement;
};

const DateTimeButton: React.FunctionComponent<IDateTimeButtonProps> = ({ color, text, style, onPress }: IDateTimeButtonProps) => (
  <TouchableOpacity onPress={onPress} style={[styles.containerStyle, style]}>
    <Icon name="date_range" size={20} color={color} />
    <SmallText style={styles.text}>{text}</SmallText>
  </TouchableOpacity>
);

const DateTimePickerIOS: React.FunctionComponent<IDateTimePickerProps> = ({
  mode,
  onChange,
  value,
  color,
  maximumDate,
  minimumDate,
  style,
  renderDate,
}: IDateTimePickerProps) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value);
  const [tempTime, setTempTime] = useState(value);
  return (
    <View>
      {mode === 'time' && renderDate !== undefined ? (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={style}>
          {renderDate(selectedTime)}
        </TouchableOpacity>
      ) : (
        <DateTimeButton
          style={style}
          onPress={() => setModalVisible(true)}
          text={selectedTime.format('DD/MM/YY')}
          color={color || viescoTheme.palette.diary}
        />
      )}
      <ModalBox isVisible={isModalVisible} onDismiss={() => setModalVisible(false)}>
        <ModalContent style={styles.modalContentContainer}>
          <View style={styles.pickerContainer}>
            <SmallText style={styles.textPicker}>{I18n.t(mode === 'time' ? 'pick-hour' : 'pick-date')} :</SmallText>
            <DateTimePicker
              mode={mode}
              locale="fr-FR"
              maximumDate={maximumDate && maximumDate.toDate()}
              minimumDate={minimumDate && minimumDate.toDate()}
              value={tempTime.toDate()}
              style={styles.iosPickerContainer}
              onChange={(event, newDate) => {
                if (event.type === 'set') {
                  setTempTime(moment(newDate));
                }
              }}
            />
          </View>
          <ModalContentBlock>
            <ButtonsOkCancel
              onCancel={() => {
                setModalVisible(false);
              }}
              onValid={() => {
                setModalVisible(false);
                setSelectedTime(tempTime);
                onChange(tempTime);
              }}
              title={I18n.t('common-ok')}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    </View>
  );
};

const DateTimePickerAndroid: React.FunctionComponent<IDateTimePickerProps> = ({
  mode,
  onChange,
  value,
  color,
  maximumDate,
  minimumDate,
  style,
  renderDate,
}: IDateTimePickerProps) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value);
  return (
    <View>
      {mode === 'time' && renderDate !== undefined ? (
        <TouchableOpacity onPress={() => setModalVisible(true)} style={style}>
          {renderDate(selectedTime)}
        </TouchableOpacity>
      ) : (
        <DateTimeButton
          style={style}
          onPress={() => setModalVisible(true)}
          text={selectedTime.format('DD/MM/YY')}
          color={color || viescoTheme.palette.diary}
        />
      )}
      {isModalVisible ? (
        <DateTimePicker
          mode={mode}
          is24Hour
          maximumDate={maximumDate && maximumDate.toDate()}
          minimumDate={minimumDate && minimumDate.toDate()}
          value={selectedTime.toDate()}
          onChange={(event, newDate) => {
            if (event.type === 'dismissed') {
              setModalVisible(false);
            } else {
              setModalVisible(false);
              setSelectedTime(moment(newDate));
              onChange(moment(newDate));
            }
          }}
        />
      ) : null}
    </View>
  );
};

export default (props: IDateTimePickerProps) => {
  return Platform.OS === 'ios' ? <DateTimePickerIOS {...props} /> : <DateTimePickerAndroid {...props} />;
};
