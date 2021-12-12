import DateTimePicker from '@react-native-community/datetimepicker';
import I18n from 'i18n-js';
import moment from 'moment';
import React, { useState } from 'react';
import { View, Platform, ViewStyle } from 'react-native';

import { Icon, ButtonsOkCancel } from '.';
import TouchableOpacity from './CustomTouchableOpacity';
import { ModalContent, ModalBox, ModalContentBlock, ModalContentText } from './Modal';

import { Text } from '~/framework/components/text';

const IconButton = ({
  icon,
  color,
  text,
  style,
  onPress,
}: {
  icon: string;
  color: string;
  text: string;
  style?: ViewStyle;
  onPress: () => void;
}) => {
  const containerStyle = {
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 8,
  };

  return (
    <TouchableOpacity onPress={onPress} style={[containerStyle, style]}>
      <Icon size={20} color={color} name={icon} />
      <Text style={{ marginHorizontal: 5 }}>{text}</Text>
    </TouchableOpacity>
  );
};

type DateTimePickerProps = {
  value: moment.Moment;
  mode: 'time' | 'date';
  minimumDate?: moment.Moment;
  maximumDate?: moment.Moment;
  renderDate?: (time: moment.Moment) => React.ReactElement;
  onChange: any;
  style?: ViewStyle;
  color?: string;
};

const DateTimePickerIOS = ({
  value,
  renderDate,
  mode,
  minimumDate,
  maximumDate,
  style,
  onChange,
  color = '#2BAB6F',
}: DateTimePickerProps) => {
  const [visible, toggleModal] = useState(false);
  const [selectedTime, changeTime] = useState(value);
  const [temporaryTime, changeTempTime] = useState(value);
  return (
    <>
      {mode == 'time' && renderDate !== undefined ? (
        <TouchableOpacity onPress={() => toggleModal(true)} style={style}>
          {renderDate(selectedTime)}
        </TouchableOpacity>
      ) : (
        <IconButton
          style={style}
          onPress={() => toggleModal(true)}
          text={selectedTime.format('DD/MM/YY')}
          color={color}
          icon="date_range"
        />
      )}

      <ModalBox isVisible={visible} onDismiss={() => toggleModal(false)}>
        <ModalContent style={{ width: 350 }}>
          <ModalContentBlock>
            <ModalContentText>{mode == 'time' ? I18n.t('pick-hour') : I18n.t('pick-date')}</ModalContentText>
          </ModalContentBlock>

          <View style={{ width: '100%', marginBottom: 35, paddingHorizontal: 20 }}>
            <DateTimePicker
              mode={mode}
              locale="fr-FR"
              maximumDate={maximumDate && maximumDate.toDate()}
              minimumDate={minimumDate && minimumDate.toDate()}
              value={temporaryTime.toDate()}
              onChange={(event, newDate) => {
                if (event.type === 'dismissed') {
                  toggleModal(false);
                } else {
                  changeTempTime(moment(newDate));
                }
              }}
            />
          </View>
          <ModalContentBlock>
            <ButtonsOkCancel
              onCancel={() => {
                toggleModal(false);
              }}
              onValid={() => {
                toggleModal(false);
                changeTime(temporaryTime);
                onChange(temporaryTime);
              }}
              title={I18n.t('common-ok')}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    </>
  );
};

const DateTimePickerAndroid = ({
  mode,
  renderDate,
  value,
  minimumDate,
  style,
  maximumDate,
  onChange,
  color = '#2BAB6F',
}: DateTimePickerProps) => {
  const [visible, toggleModal] = useState(false);
  const [selectedTime, changeTime] = useState(value);
  return (
    <>
      {mode == 'time' && renderDate !== undefined ? (
        <TouchableOpacity onPress={() => toggleModal(true)} style={style}>
          {renderDate(selectedTime)}
        </TouchableOpacity>
      ) : (
        <IconButton
          style={style}
          onPress={() => toggleModal(true)}
          text={selectedTime.format('DD/MM/YY')}
          color={color}
          icon="date_range"
        />
      )}
      {visible && (
        <DateTimePicker
          mode={mode}
          is24Hour
          maximumDate={maximumDate && maximumDate.toDate()}
          minimumDate={minimumDate && minimumDate.toDate()}
          value={selectedTime.toDate()}
          onChange={(event, newDate) => {
            if (event.type === 'dismissed') {
              toggleModal(false);
            } else {
              toggleModal(false);
              changeTime(moment(newDate));
              onChange(moment(newDate));
            }
          }}
        />
      )}
    </>
  );
};

export default (props: DateTimePickerProps) => {
  switch (Platform.OS) {
    case 'ios': {
      return <DateTimePickerIOS {...props} />;
    }
    default: {
      return <DateTimePickerAndroid {...props} />;
    }
  }
};
