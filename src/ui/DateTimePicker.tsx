import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import React, { useState } from 'react';
import { ColorValue, Platform, StyleSheet, ViewStyle } from 'react-native';

import theme from '~/app/theme';
import { TouchCardWithoutPadding } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { Picture } from '~/framework/components/picture';
import { SmallText } from '~/framework/components/text';

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: UI_SIZES.spacing.minor,
  },
  buttonText: {
    marginLeft: UI_SIZES.spacing.tiny,
  },
});

interface IDateTimeButtonProps {
  color: ColorValue;
  icon: string;
  text: string;
  isDisabled?: boolean;
  style?: ViewStyle;
  onPress: () => void;
}

interface IDateTimePickerProps {
  mode: 'time' | 'date';
  value: moment.Moment;
  color?: ColorValue;
  isDisabled?: boolean;
  maximumDate?: moment.Moment;
  minimumDate?: moment.Moment;
  style?: ViewStyle;
  onChange: (value: moment.Moment) => void;
}

const DateTimeButton: React.FunctionComponent<IDateTimeButtonProps> = ({
  color,
  icon,
  text,
  isDisabled,
  style,
  onPress,
}: IDateTimeButtonProps) => (
  <TouchCardWithoutPadding onPress={onPress} disabled={isDisabled} style={[styles.buttonContainer, style]}>
    <Picture type="NamedSvg" name={icon} width={20} height={20} fill={color} />
    <SmallText style={styles.buttonText}>{text}</SmallText>
  </TouchCardWithoutPadding>
);

const DateTimePickerIOS: React.FunctionComponent<IDateTimePickerProps> = ({
  mode,
  value,
  isDisabled,
  maximumDate,
  minimumDate,
  style,
  onChange,
}: IDateTimePickerProps) => {
  const [date, setDate] = useState(value);
  return (
    <DateTimePicker
      mode={mode}
      onChange={(event, newDate) => {
        if (event.type === 'set') {
          setDate(moment(newDate));
          onChange(moment(newDate));
        }
      }}
      value={date.toDate()}
      disabled={isDisabled}
      maximumDate={maximumDate?.toDate()}
      minimumDate={minimumDate?.toDate()}
      locale="fr-FR"
      style={style}
    />
  );
};

const DateTimePickerAndroid: React.FunctionComponent<IDateTimePickerProps> = ({
  mode,
  value,
  color = theme.palette.primary.regular,
  isDisabled,
  maximumDate,
  minimumDate,
  style,
  onChange,
}: IDateTimePickerProps) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(value);
  return (
    <>
      <DateTimeButton
        icon={mode === 'date' ? 'ui-calendarLight' : 'ui-clock'}
        color={color}
        text={selectedTime.format(mode === 'date' ? 'L' : 'LT')}
        onPress={() => setModalVisible(true)}
        style={style}
      />
      {isModalVisible ? (
        <DateTimePicker
          mode={mode}
          is24Hour
          maximumDate={maximumDate?.toDate()}
          minimumDate={minimumDate?.toDate()}
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
    </>
  );
};

export default (props: IDateTimePickerProps) => {
  return Platform.OS === 'ios' ? <DateTimePickerIOS {...props} /> : <DateTimePickerAndroid {...props} />;
};
