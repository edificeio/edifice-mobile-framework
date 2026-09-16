import React from 'react';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, View } from 'react-native';

import { Temporal } from '@js-temporal/polyfill';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { useConfirmRemove } from '~/app/navigation/use-confirm-remove';
import { headerAction, modalScreenOptions } from '~/app/navigation/util';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import InputContainer from '~/framework/components/inputs/container';
import Label from '~/framework/components/inputs/container/label';
import { RichEditor, RichEditorForm } from '~/framework/components/inputs/rich-text';
import TextInput from '~/framework/components/inputs/text';
import DayPicker from '~/framework/components/pickers/day';
import Separator from '~/framework/components/separator';
import Toast from '~/framework/components/toast';
import { withSession } from '~/framework/modules/auth/util';
import { createHomeworkDiaryEntry } from '~/framework/modules/homework/actions/createEntry';
import { HomeworkNavigationParams, homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { IModalsNavigationParams, ModalsRouteNames } from '~/framework/navigation/modals';
import { StackNavigationAction } from '~/framework/navigation/types';

import { fetchHomeworkTasks } from '../actions/tasks';

export interface HomeworkCreateScreenNavigationParams {
  diaryId: string;
  navActionOnSuccess: StackNavigationAction;
}

export type HomeworkCreateScreenProps = NativeStackScreenProps<HomeworkNavigationParams, typeof homeworkRouteNames.homeworkCreate>;

export const HomeworkCreateScreenOptions = modalScreenOptions('fullScreenModal', () => ({
  title: I18n.get('homework-create-title'),
}));

const uploadParams = {
  parent: 'protected',
};

export const HomeworkCreateScreen = withSession(function ({
  navigation,
  route,
  route: {
    params: { diaryId, navActionOnSuccess },
  },
}: HomeworkCreateScreenProps) {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();
  const today = Temporal.Now.plainDateISO();
  const defaultSelectedDate = today.dayOfWeek === today.daysInWeek ? today.add(new Temporal.Duration(0, 0, 0, 1)) : today;

  const editorRef = React.useRef<RichEditor>(null);

  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [date, setDate] = React.useState(defaultSelectedDate);

  const isEditing = !saving && (!date.equals(defaultSelectedDate) || !!title || !!content);

  useConfirmRemove(isEditing, {
    text: I18n.get('homework-create-leavealert-text'),
    title: I18n.get('homework-create-leavealert-title'),
  });

  const topForm = (
    <View style={styles.topForm}>
      <InputContainer
        label={{ icon: 'ui-calendarLight', text: I18n.get('homework-create-date-title') }}
        input={
          <DayPicker
            style={styles.dayPicker}
            onDateChange={selectedDate => {
              setDate(Temporal.PlainDate.from(selectedDate.format('YYYY-MM-DD')));
            }}
          />
        }
      />
      <InputContainer
        label={{ icon: 'ui-book', text: I18n.get('homework-create-subject-title') }}
        input={
          <TextInput
            placeholder={I18n.get('homework-create-subject-placeholder')}
            onChangeText={setTitle}
            value={title}
            maxLength={64}
            returnKeyType="next"
            onSubmitEditing={() => editorRef?.current?.focusContentEditor()}
          />
        }
      />
      <Pressable onPress={() => editorRef?.current?.focusContentEditor()}>
        <Label icon="ui-text-page" text={I18n.get('homework-create-description-title')} />
        <Separator />
      </Pressable>
    </View>
  );

  const handleSave = React.useCallback(async () => {
    try {
      Keyboard.dismiss();
      // ToDo: here display alert confirm if date is before tomorrow
      setSaving(true);
      await dispatch(createHomeworkDiaryEntry(diaryId, date, title, content));
      await dispatch(fetchHomeworkTasks(diaryId));
      navigation.dispatch(navActionOnSuccess);
      requestAnimationFrame(() => {
        Toast.showSuccess(I18n.get('homework-create-success'));
      });
    } catch {
      Toast.showError(I18n.get('homework-create-error-publish'));
      setSaving(false);
    }
  }, [content, date, diaryId, dispatch, navActionOnSuccess, navigation, title]);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: p =>
        saving ? (
          <ActivityIndicator size="small" color={theme.ui.text.inverse} />
        ) : (
          headerAction(
            {
              disabled: content.trim().length === 0 || title.trim().length === 0,
              icon: 'ui-send',
              onPress: handleSave,
              testID: 'homework-create-save',
            },
            p,
          ).element
        ),
    });
  }, [content, handleSave, navigation, saving, title]);

  return (
    <RichEditorForm
      editorRef={editorRef}
      style={styles.page}
      route={route as unknown as NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.RichTextEditor>['route']}
      navigation={
        navigation as unknown as NativeStackScreenProps<IModalsNavigationParams, ModalsRouteNames.RichTextEditor>['navigation']
      }
      topForm={topForm}
      initialContentHtml=""
      onChangeText={setContent}
      saving={true} // only because we want to handle confirm remove here ourselves
      placeholder={I18n.get('homework-create-description-placeholder')}
      uploadParams={uploadParams}
    />
  );
});

const styles = StyleSheet.create({
  dayPicker: {
    borderColor: theme.palette.grey.cloudy,
    borderRadius: UI_SIZES.radius.selector,
    borderWidth: UI_SIZES.border.thin,
  },
  page: { gap: UI_SIZES.spacing.medium, padding: UI_SIZES.spacing.medium },
  topForm: { gap: UI_SIZES.spacing.medium },
});
