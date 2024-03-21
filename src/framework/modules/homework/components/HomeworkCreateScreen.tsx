import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Moment } from 'moment';
import * as React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import PrimaryButton from '~/framework/components/buttons/primary';
import { UI_SIZES } from '~/framework/components/constants';
import InputContainer from '~/framework/components/inputs/container';
import MultilineTextInput from '~/framework/components/inputs/multiline';
import TextInput from '~/framework/components/inputs/text';
import { ImagePicked } from '~/framework/components/menus/actions';
import { KeyboardPageView } from '~/framework/components/page';
import DayPicker from '~/framework/components/pickers/day';
import { defaultSelectedDate } from '~/framework/components/pickers/day/component';
import Toast from '~/framework/components/toast';
import usePreventBack from '~/framework/hooks/prevent-back';
import moduleConfig from '~/framework/modules/homework/module-config';
import { HomeworkNavigationParams, homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { navBarOptions } from '~/framework/navigation/navBar';
import { today } from '~/framework/util/date';
import { SyncedFile } from '~/framework/util/fileHandler';
import { uppercaseFirstLetter } from '~/framework/util/string';
import { ConnectionTrackerState } from '~/infra/reducers/connectionTracker';
import { ILocalAttachment } from '~/ui/Attachment';
import { AttachmentPicker } from '~/ui/AttachmentPicker';

export interface HomeworkCreateScreenDataProps {
  diaryId?: string;
  connectionTrackerState: ConnectionTrackerState;
}

export interface HomeworkCreateScreenEventProps {
  handleUploadEntryImages(images: ImagePicked[]): Promise<SyncedFile[]>;
  handleCreateDiaryEntry(
    diaryId: string,
    date: Moment,
    title: string,
    content: string,
    uploadedEntryImages?: SyncedFile[],
  ): Promise<string | undefined>;
  handleGetHomeworkTasks(diaryId: string): Promise<void>;
  dispatch: ThunkDispatch<any, any, any>;
}

interface HomeworkCreateScreenState {
  date: Moment | undefined;
  subject: string;
  description: string;
  images: ImagePicked[] | ILocalAttachment[];
  isCreatingEntry: boolean;
}

export type IHomeworkCreateScreenProps = HomeworkCreateScreenEventProps &
  HomeworkCreateScreenDataProps &
  NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkCreate>;

const styles = StyleSheet.create({
  button: {
    marginTop: UI_SIZES.spacing.large,
  },
  dayPickerContainer: {
    borderColor: theme.palette.grey.stone,
    borderWidth: UI_SIZES.border.thin,
    borderRadius: UI_SIZES.radius.selector,
  },
  inputContainer: {
    marginTop: UI_SIZES.spacing.big,
  },
  page: {
    backgroundColor: theme.ui.background.card,
    marginBottom: Platform.select({ ios: -UI_SIZES.screen.bottomInset, default: 0 }),
  },
  scrollView: {
    backgroundColor: theme.ui.background.card,
    padding: UI_SIZES.spacing.medium,
  },
});

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkCreate>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: I18n.get('homework-create-title'),
  }),
});

function PreventBack(props: { showAlert: boolean }) {
  usePreventBack({
    title: I18n.get('homework-create-leavealert-title'),
    text: I18n.get('homework-create-leavealert-text'),
    showAlert: props.showAlert,
  });
  return null;
}

export class HomeworkCreateScreen extends React.PureComponent<IHomeworkCreateScreenProps, HomeworkCreateScreenState> {
  state: HomeworkCreateScreenState = {
    date: undefined,
    subject: '',
    description: '',
    images: [],
    isCreatingEntry: false,
  };

  verifyDate = () => {
    const { date } = this.state;
    const isPastDate = date?.isBefore(today(), 'day');

    if (isPastDate) {
      Alert.alert(I18n.get('homework-create-warning-past-title'), I18n.get('homework-create-warning-past-text'), [
        {
          text: I18n.get('homework-create-warning-past-modify'),
        },
        {
          text: I18n.get('homework-create-warning-past-add'),
          onPress: () => this.createEntry(),
        },
      ]);
    } else this.createEntry();
  };

  async createEntry() {
    try {
      const {
        connectionTrackerState,
        navigation,
        handleCreateDiaryEntry,
        handleGetHomeworkTasks,
        handleUploadEntryImages,
        diaryId,
        route,
      } = this.props;
      const { date, subject, description, images } = this.state;

      this.setState({ isCreatingEntry: true });

      if (!diaryId) {
        throw new Error('No diary id');
      }

      if (!connectionTrackerState?.connected) {
        Toast.showError(I18n.get('homework-create-error-offline'));
        throw new Error('Offline');
      }

      // Upload images (if added)
      let uploadedEntryImages: undefined | SyncedFile[];
      if (images.length > 0) {
        try {
          uploadedEntryImages = await handleUploadEntryImages(images);
        } catch (e: any) {
          // Full storage management
          // statusCode = 400 on iOS and code = 'ENOENT' on Android
          if (e.response?.statusCode === 400 || e.code === 'ENOENT') {
            Toast.showError(I18n.get('homework-create-error-fullstorage'));
          } else {
            Toast.showError(I18n.get('homework-create-error-upload'));
          }
          throw new Error('Upload failure');
        }
      }

      // Translate description into html
      const htmlContent = description.replace(/\n/g, '<br>');

      // Create entry
      await handleCreateDiaryEntry(diaryId, date!, subject, htmlContent, uploadedEntryImages);
      await handleGetHomeworkTasks(diaryId);
      if (route.params.sourceRoute === homeworkRouteNames.homeworkTaskList) {
        navigation.goBack();
      } else navigation.popToTop();
      Toast.showSuccess(I18n.get('homework-create-success'));
    } catch (e) {
      const isHandled = (e as Error).message && ((e as Error).message === 'Upload failure' || (e as Error).message === 'Offline');
      if (!isHandled) Toast.showError(I18n.get('homework-create-error-publish'));
    } finally {
      this.setState({ isCreatingEntry: false });
    }
  }

  render() {
    const { date, subject, description, images, isCreatingEntry } = this.state;
    const isDefaultDateSelected = date?.isSame(defaultSelectedDate);
    const isEditing = !isDefaultDateSelected || !!subject || !!description || !!images.length;
    const isRequiredFieldEmpty = !date || !subject || !description;
    const descriptionFieldRef: { current: any } = React.createRef();
    const attachments = images.map(image => ({
      mime: image.type,
      name: image.fileName,
      uri: image.uri,
    }));

    return (
      <>
        <PreventBack showAlert={isEditing && !isCreatingEntry} />
        <KeyboardPageView style={styles.page}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollView}>
            <InputContainer
              label={{ text: I18n.get('homework-create-date-title'), icon: 'ui-calendarLight' }}
              input={
                <DayPicker onDateChange={selectedDate => this.setState({ date: selectedDate })} style={styles.dayPickerContainer} />
              }
            />
            <InputContainer
              style={styles.inputContainer}
              label={{ text: I18n.get('homework-create-subject-title'), icon: 'ui-book' }}
              input={
                <TextInput
                  placeholder={I18n.get('homework-create-subject-placeholder')}
                  onChangeText={text => this.setState({ subject: text })}
                  value={subject}
                  maxLength={64}
                  returnKeyType="next"
                  onSubmitEditing={() => descriptionFieldRef?.current?.focus()}
                  blurOnSubmit={false}
                />
              }
            />
            <InputContainer
              style={styles.inputContainer}
              label={{ text: I18n.get('homework-create-description-title'), icon: 'ui-textPage' }}
              input={
                <MultilineTextInput
                  ref={descriptionFieldRef}
                  placeholder={I18n.get('homework-create-description-placeholder')}
                  numberOfLines={4}
                  onChangeText={text => this.setState({ description: text })}
                  value={description}
                />
              }
            />
            <View style={styles.inputContainer}>
              <AttachmentPicker
                onlyImages
                notifierId={uppercaseFirstLetter(moduleConfig.name)}
                imageCallback={image => this.setState(prevState => ({ images: [...prevState.images, image] }))}
                onAttachmentRemoved={selectedImages => this.setState({ images: selectedImages })}
                attachments={attachments}
              />
            </View>
            <PrimaryButton
              text={I18n.get('homework-create-addhomework')}
              action={this.verifyDate}
              disabled={isRequiredFieldEmpty}
              loading={isCreatingEntry}
              style={styles.button}
            />
          </ScrollView>
        </KeyboardPageView>
      </>
    );
  }
}

export default HomeworkCreateScreen;
