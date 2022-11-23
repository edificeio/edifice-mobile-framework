import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Asset } from 'react-native-image-picker';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallActionText } from '~/framework/components/text';
import { LocalFile } from '~/framework/util/fileHandler';
import { DocumentPicked, FilePicker } from '~/infra/filePicker';
import { FormQuestionCard } from '~/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse, IResponseFile } from '~/modules/form/reducer';
import { Attachment } from '~/modules/zimbra/components/Attachment';

import { FormAnswerText } from './FormAnswerText';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderWidth: 1,
    borderRadius: 5,
  },
  textIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: UI_SIZES.spacing.big,
    marginRight: UI_SIZES.spacing.minor,
  },
  textIconContainerSmallerMargin: {
    marginVertical: UI_SIZES.spacing.small,
  },
  actionText: {
    textAlign: 'center',
    marginRight: UI_SIZES.spacing.minor,
  },
});

interface IFormFileCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormFileCard = ({ isDisabled, question, responses, onChangeAnswer, onEditQuestion }: IFormFileCardProps) => {
  const [files, setFiles] = React.useState<IResponseFile[]>(responses[0]?.files ?? []);
  const { title, mandatory } = question;
  const filesAdded = files.length > 0;

  React.useEffect(() => {
    const answer = files.length ? 'Fichier déposé' : '';

    if (responses.length) {
      responses[0].answer = answer;
      responses[0].files = files;
    } else {
      responses.push({
        questionId: question.id,
        answer,
        files,
      });
    }
    onChangeAnswer(question.id, responses);
  }, [files]);

  const addFile = (lf: LocalFile) => {
    const file = {
      id: null,
      filename: lf.filename,
      type: lf.filetype,
      lf,
    } as IResponseFile;

    setFiles(previousFiles => [...previousFiles, file]);
  };

  const removeFile = (file: IResponseFile) => {
    setFiles(files.filter(a => a !== file));
  };

  const filePickedToLocalFile = (img: Asset | DocumentPicked) =>
    new LocalFile(
      {
        filename: img.fileName as string,
        filepath: img.uri as string,
        filetype: img.type as string,
      },
      { _needIOSReleaseSecureAccess: false },
    );

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled ? (
        <FormAnswerText answer={responses[0]?.answer ? files.map(a => a.filename).join('\n') : undefined} />
      ) : (
        <View style={styles.container}>
          <FilePicker multiple callback={file => addFile(filePickedToLocalFile(file))}>
            <View style={[styles.textIconContainer, filesAdded && styles.textIconContainerSmallerMargin]}>
              <SmallActionText style={styles.actionText}>{I18n.t('common.addFiles')}</SmallActionText>
              <Icon name="attachment" size={18} color={theme.palette.primary.regular} />
            </View>
          </FilePicker>
          <FlatList
            data={files}
            keyExtractor={attachment => attachment.filename}
            renderItem={({ item }) => <Attachment name={item.filename} type={item.type} onRemove={() => removeFile(item)} />}
            bottomInset={false}
          />
        </View>
      )}
    </FormQuestionCard>
  );
};
