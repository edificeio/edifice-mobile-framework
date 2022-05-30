import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { ScrollView, TextInput } from 'react-native-gesture-handler';

import { Icon } from '~/framework/components/picture/Icon';
import { Text, TextBold } from '~/framework/components/text';
import { LocalFile } from '~/framework/util/fileHandler';
import { DocumentPicked, FilePicker, ImagePicked } from '~/infra/filePicker';
import { CommonStyles } from '~/styles/common/styles';
import { DialogButtonOk } from '~/ui/ConfirmDialog';
import TouchableOpacity from '~/ui/CustomTouchableOpacity';
import DateTimePicker from '~/ui/DateTimePicker';

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  switchContainer: {
    justifyContent: 'center',
    padding: 10,
  },
  switchPart: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'lightgrey',
    padding: 15,
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
  rightSwitchSingleText: { marginHorizontal: 10 },
  selected: {
    backgroundColor: 'white',
    elevation: CommonStyles.elevation,
    shadowColor: CommonStyles.shadowColor,
    shadowOffset: CommonStyles.shadowOffset,
    shadowOpacity: CommonStyles.shadowOpacity,
    shadowRadius: CommonStyles.shadowRadius,
  },
  row: {
    marginVertical: 10,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 15,
    flexGrow: 1,
    flexBasis: 0,
  },
  timePickerContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    backgroundColor: 'white',
    alignItems: 'center',
    margin: 10,
  },
  timePickerRender: {
    borderStyle: 'solid',
    borderBottomWidth: 2,
    borderColor: '#FCB602',
    padding: 10,
  },
  timePickerTitleText: {
    color: '#FCB602',
    textTransform: 'uppercase',
  },
  timePickerDate: {
    padding: 10,
    fontSize: 24,
  },
  timeContainer: {
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 30,
  },
  inputContainer: {
    backgroundColor: 'white',
    flexDirection: 'column',
    paddingHorizontal: 25,
    paddingTop: 25,
  },
  inputContainerText: { marginBottom: 10 },
  filePickerStyle: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  iconPickerMarginRight: { marginRight: 5 },
  attachment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    marginLeft: 20,
  },
  attachmentNameText: {
    flex: 1,
    color: CommonStyles.primary,
  },
  iconAttMarginRight: { marginRight: 10 },
  dialogButtonOk: {
    alignSelf: 'center',
    marginBottom: 10,
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
            <Text>{I18n.t('viesco-several-days')}</Text>
            <TextBold style={styles.rightSwitchSingleText}>+</TextBold>
          </View>
        ) : (
          <View>
            <Text>{I18n.t('viesco-several-days')}</Text>
            <TextBold>
              {I18n.t('viesco-from')} {startDate.format('DD/MM')} {I18n.t('viesco-to')} {endDate.format('DD/MM')}
            </TextBold>
          </View>
        )}
      </TouchableOpacity>
    );

    const LeftSwitchComponent = () => (
      <TouchableOpacity
        style={[styles.switchPart, styles.leftSwitch, this.state.switchState === SwitchState.SINGLE && styles.selected]}
        onPress={() => this.setState({ switchState: SwitchState.SINGLE })}>
        <Text>{I18n.t('viesco-single-day')}</Text>
        <TextBold>{startDate.format('DD/MM')}</TextBold>
      </TouchableOpacity>
    );

    const TimePickerComponent = ({ time, onChange, title }) => (
      <DateTimePicker
        value={time}
        style={styles.timePickerContainer}
        renderDate={date => (
          <>
            <View style={styles.timePickerRender}>
              <Text style={styles.timePickerTitleText}>{title}</Text>
            </View>
            <TextBold style={styles.timePickerDate}>{date.format('HH    :    mm')}</TextBold>
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

    const RenderAttachment = () => (
      <View style={styles.attachment}>
        <Icon size={20} style={styles.iconAttMarginRight} color={CommonStyles.primary} name="attachment" />
        <Text style={styles.attachmentNameText}>{this.props.attachment.filename}</Text>
        <TouchableOpacity onPress={() => this.props.removeAttachment()}>
          <Icon name="close" style={styles.iconAttMarginRight} color="red" />
        </TouchableOpacity>
      </View>
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
            <TextBold style={styles.inputContainerText}>{I18n.t('viesco-absence-motive')}</TextBold>
            <TextInput
              multiline
              placeholder={I18n.t('viesco-enter-text')}
              value={comment}
              underlineColorAndroid="lightgrey"
              onChangeText={updateComment}
            />
            <FilePicker multiple callback={att => this.props.onPickAttachment(att)} style={styles.filePickerStyle}>
              <Icon size={20} name="attachment" style={styles.iconAttMarginRight} />
              <Text>{I18n.t('viesco-attachment')}</Text>
            </FilePicker>
          </View>
          {attachment && <RenderAttachment />}
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
