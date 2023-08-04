import { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import uuid from 'react-native-uuid';
import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import ActionButton from '~/framework/components/buttons/action';
import { UI_SIZES } from '~/framework/components/constants';
import DayPicker from '~/framework/components/daypicker';
import InputContainer from '~/framework/components/inputs/container';
import TextInput from '~/framework/components/inputs/text';
import { KeyboardPageView } from '~/framework/components/page';

import { HomeworkNavigationParams, homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { ILocalAttachment } from '~/ui/Attachment';
import { AttachmentPicker } from '~/ui/AttachmentPicker';
import { ImagePicked } from '~/framework/components/menus/actions';
import { Moment } from 'moment';
import moduleConfig from '~/framework/modules/homework/module-config';
import { uppercaseFirstLetter } from '~/framework/util/string';
import MultilineTextInput from '~/framework/components/inputs/multiline';
import { navBarOptions } from '~/framework/navigation/navBar';
import { signedFetch } from '~/infra/fetchWithCache';
import { getSession } from '../../auth/reducer';

export interface HomeworkCreateScreenDataProps {}

export interface HomeworkCreateScreenEventProps {}

interface HomeworkCreateScreenState {
  date: Moment | undefined;
  subject: string;
  description: string;
  images: ImagePicked[] | ILocalAttachment[];
  isCreatingHomework: boolean;
}

export interface HomeworkCreateScreenNavigationParams {
  diaryId?: string;
}

export type IHomeworkCreateScreenProps = HomeworkCreateScreenDataProps &
  HomeworkCreateScreenEventProps &
  NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkCreate>;

const styles = StyleSheet.create({
  button: {
    marginTop: UI_SIZES.spacing.large,
  },
  inputContainer: {
    marginTop: UI_SIZES.spacing.big,
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

export class HomeworkCreateScreen extends React.PureComponent<IHomeworkCreateScreenProps, HomeworkCreateScreenState> {
  state: HomeworkCreateScreenState = {
    date: undefined,
    subject: '',
    description: '',
    images: [],
    isCreatingHomework: false,
  };

  render() {
    const { date, subject, description, images, isCreatingHomework } = this.state;
    const isButtonDisabled = !date || !subject || !description;

    return (
      <KeyboardPageView>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <InputContainer
            label={{ text: I18n.get('homework-create-date-title'), icon: 'ui-calendarLight' }}
            input={<DayPicker onDateChange={date => this.setState({ date })} />}
          />
          <View style={styles.inputContainer}>
            <InputContainer
              label={{ text: I18n.get('homework-create-subject-title'), icon: 'ui-book' }}
              input={
                <TextInput
                  placeholder={I18n.get('homework-create-subject-placeholder')}
                  onChangeText={text => this.setState({ subject: text })}
                  value={subject}
                  maxLength={64}
                />
              }
            />
          </View>
          <View style={styles.inputContainer}>
            <InputContainer
              label={{ text: I18n.get('homework-create-description-title'), icon: 'ui-textPage' }}
              input={
                <MultilineTextInput
                  placeholder={I18n.get('homework-create-description-placeholder')}
                  numberOfLines={4}
                  onChangeText={text => this.setState({ description: text })}
                  value={description}
                />
              }
            />
          </View>
          <View style={styles.inputContainer}>
            <AttachmentPicker
              onlyImages
              notifierId={uppercaseFirstLetter(moduleConfig.name)}
              imageCallback={image => this.setState(prevState => ({ images: [...prevState.images, image] }))}
              onAttachmentRemoved={images => this.setState({ images })}
              attachments={images.map(image => ({
                mime: image.type,
                name: image.fileName,
                uri: image.uri,
              }))}
            />
          </View>
          <ActionButton
            text={I18n.get('homework-create-addhomework')}
            action={async () => {
              const { navigation, route } = this.props;
              try {
                const session = getSession();
                const diaryId = route.params.diaryId;
                await signedFetch(`${session?.platform.url}/homeworks/${diaryId}/entry`, {
                  method: 'PUT',
                  body: JSON.stringify({
                    date,
                    entryid: uuid.v4(),
                    title: subject,
                    value: description,
                  }),
                });
                navigation.goBack();
              } catch (e) {}
            }}
            disabled={isButtonDisabled}
            loading={isCreatingHomework}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardPageView>
    );
  }
}

export default HomeworkCreateScreen;
