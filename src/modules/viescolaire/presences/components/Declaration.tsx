import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { HeadingLText, SmallBoldText, SmallText } from '~/framework/components/text';
import { LocalFile } from '~/framework/util/fileHandler';
import { DocumentPicked, FilePicker, ImagePicked } from '~/infra/filePicker';
import { viescoTheme } from '~/modules/viescolaire/viesco/utils/viescoTheme';
import { Attachment } from '~/modules/zimbra/components/Attachment';
import { DialogButtonOk } from '~/ui/ConfirmDialog';
import DateTimePicker from '~/ui/DateTimePicker';

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  switchContainer: {
    justifyContent: 'center',
    padding: UI_SIZES.spacing.small,
  },
  switchPart: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.grey.cloudy,
    padding: UI_SIZES.spacing.small,
    justifyContent: 'center',
  },
  leftSwitch: {
    borderBottomLeftRadius: 10,
    borderTopLeftRadius: 10,
  },
  rightSwitch: {
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
  },
  rightSwitchSingle: { flexDirection: 'row' },
  rightSwitchSingleText: { marginHorizontal: UI_SIZES.spacing.minor },
  selected: {
    backgroundColor: theme.palette.grey.white,
    elevation: 20,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  row: {
    marginVertical: UI_SIZES.spacing.small,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  timePickerContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    backgroundColor: theme.palette.grey.white,
    alignItems: 'center',
    margin: UI_SIZES.spacing.minor,
  },
  timePickerRender: {
    borderStyle: 'solid',
    borderBottomWidth: 2,
    borderColor: viescoTheme.palette.presences,
    padding: UI_SIZES.spacing.minor,
  },
  timePickerTitleText: {
    color: viescoTheme.palette.presences,
    textTransform: 'uppercase',
  },
  timePickerDate: {
    padding: UI_SIZES.spacing.small,
  },
  inputContainer: {
    backgroundColor: theme.palette.grey.white,
    flexDirection: 'column',
    paddingHorizontal: UI_SIZES.spacing.big,
    paddingTop: UI_SIZES.spacing.medium,
  },
  inputContainerText: { marginBottom: UI_SIZES.spacing.minor },
  motiveTextInput: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.cloudy,
    paddingVertical: UI_SIZES.spacing.tiny,
  },
  filePickerStyle: {
    flexDirection: 'row',
    paddingVertical: UI_SIZES.spacing.medium,
  },
  iconAttMarginRight: { marginRight: UI_SIZES.spacing.small },
  dialogButtonOk: {
    alignSelf: 'center',
    marginVertical: UI_SIZES.spacing.minor,
  },
});

type DeclarationProps = {
  startDate: moment.Moment;
  updateStartDate: any;
  endDate: moment.Moment;
  updateEndDate: any;
  comment: string;
  updateComment: any;
  attachment: LocalFile;
  pickAttachment: () => void;
  onPickAttachment: (att: ImagePicked | DocumentPicked) => void;
  removeAttachment: () => void;
  submit: () => void;
  validate: () => boolean;
};

enum SwitchState {
  SINGLE,
  SEVERAL,
}

type DeclarationState = {
  switchState: SwitchState;
};

export default class AbsenceDeclaration extends React.PureComponent<DeclarationProps, DeclarationState> {
  constructor(props) {
    super(props);
    this.state = {
      switchState: SwitchState.SINGLE,
    };
  }

  public componentDidUpdate(prevProps: DeclarationProps, prevState: DeclarationState) {
    const singleDay = this.state.switchState === SwitchState.SINGLE;
    const differentDay =
      this.props.endDate.year() !== this.props.startDate.year() ||
      this.props.endDate.dayOfYear() !== this.props.startDate.dayOfYear();

    if (singleDay && differentDay) {
      this.props.updateEndDate(
        moment(this.props.endDate).year(this.props.startDate.year()).dayOfYear(this.props.startDate.dayOfYear()),
      );
    }
  }

  public render() {
    const { startDate, updateStartDate, endDate, updateEndDate, comment, updateComment, attachment, submit } = this.props;

    const RightSwitchComponent = () => (
      <TouchableOpacity
        style={[styles.switchPart, styles.rightSwitch, this.state.switchState === SwitchState.SEVERAL && styles.selected]}
        onPress={() => this.setState({ switchState: SwitchState.SEVERAL })}>
        {this.state.switchState === SwitchState.SINGLE ? (
          <View style={styles.rightSwitchSingle}>
            <SmallText>{I18n.t('viesco-several-days')}</SmallText>
            <SmallBoldText style={styles.rightSwitchSingleText}>+</SmallBoldText>
          </View>
        ) : (
          <View>
            <SmallText>{I18n.t('viesco-several-days')}</SmallText>
            <SmallBoldText>
              {I18n.t('viesco-from')} {startDate.format('DD/MM')} {I18n.t('viesco-to')} {endDate.format('DD/MM')}
            </SmallBoldText>
          </View>
        )}
      </TouchableOpacity>
    );

    const LeftSwitchComponent = () => (
      <TouchableOpacity
        style={[styles.switchPart, styles.leftSwitch, this.state.switchState === SwitchState.SINGLE && styles.selected]}
        onPress={() => this.setState({ switchState: SwitchState.SINGLE })}>
        <SmallText>{I18n.t('viesco-single-day')}</SmallText>
        <SmallBoldText>{startDate.format('DD/MM')}</SmallBoldText>
      </TouchableOpacity>
    );

    const TimePickerComponent = ({ time, onChange, title }) => (
      <DateTimePicker
        value={time}
        style={styles.timePickerContainer}
        renderDate={date => (
          <>
            <View style={styles.timePickerRender}>
              <SmallText style={styles.timePickerTitleText}>{title}</SmallText>
            </View>
            <HeadingLText style={styles.timePickerDate}>{date.format('HH : mm')}</HeadingLText>
          </>
        )}
        mode="time"
        onChange={onChange}
      />
    );

    const DatePickers = () => (
      <>
        {this.state.switchState === SwitchState.SINGLE ? (
          <DateTimePicker mode="date" value={startDate} minimumDate={moment().startOf('day')} onChange={updateStartDate} />
        ) : (
          <>
            <DateTimePicker
              mode="date"
              value={startDate}
              minimumDate={moment().startOf('day')}
              maximumDate={endDate}
              onChange={updateStartDate}
            />
            <DateTimePicker mode="date" value={endDate} minimumDate={startDate} onChange={updateEndDate} />
          </>
        )}
      </>
    );

    return (
      <KeyboardAvoidingView
        enabled={Platform.OS === 'ios'}
        behavior="padding"
        keyboardVerticalOffset={60}
        style={styles.keyboardAvoidingContainer}>
        <ScrollView>
          <View style={[styles.row, styles.switchContainer]}>
            <LeftSwitchComponent />
            <RightSwitchComponent />
          </View>
          <View style={styles.row}>
            <DatePickers />
          </View>
          <View style={styles.row}>
            <TimePickerComponent title={I18n.t('viesco-from-hour')} time={startDate} onChange={updateStartDate} />
            <TimePickerComponent title={I18n.t('viesco-to-hour')} time={endDate} onChange={updateEndDate} />
          </View>
          <View style={[styles.row, styles.inputContainer]}>
            <SmallBoldText style={styles.inputContainerText}>{I18n.t('viesco-absence-motive')}</SmallBoldText>
            <TextInput
              multiline
              placeholder={I18n.t('viesco-enter-text')}
              value={comment}
              style={styles.motiveTextInput}
              onChangeText={updateComment}
            />
            {!(attachment && attachment.filename !== null && attachment.filename !== undefined && attachment.filename !== '') ? (
              <FilePicker callback={att => this.props.onPickAttachment(att)} style={styles.filePickerStyle}>
                <Icon size={20} name="attachment" style={styles.iconAttMarginRight} />
                <SmallText>{I18n.t('viesco-attachment')}</SmallText>
              </FilePicker>
            ) : null}
          </View>
          {attachment ? (
            <Attachment
              name={attachment.filename}
              type={attachment.filetype}
              uploadSuccess
              onRemove={this.props.removeAttachment}
            />
          ) : null}
          <DialogButtonOk
            style={styles.dialogButtonOk}
            disabled={!this.props.validate()}
            label={I18n.t('viesco-validate')}
            onPress={submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}
