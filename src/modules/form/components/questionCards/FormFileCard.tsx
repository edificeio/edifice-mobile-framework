import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallActionText } from '~/framework/components/text';
import { LocalFile } from '~/framework/util/fileHandler';
import { FilePicker } from '~/infra/filePicker';
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
  files: IResponseFile[];
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormFileCard = ({ isDisabled, question, responses, onChangeAnswer, onEditQuestion }: IFormFileCardProps) => {
  const [attachments, setAttachments] = React.useState<LocalFile[]>([]);
  const { title, mandatory } = question;
  const filesAdded = attachments.length > 0;

  React.useEffect(() => {
    const answer = attachments.length ? 'Fichier déposé' : '';

    if (responses.length) {
      responses[0].answer = answer;
    } else {
      responses.push({
        questionId: question.id,
        answer,
      });
    }
    onChangeAnswer(question.id, responses);
  }, [attachments]);

  const addFile = async (file: LocalFile) => {
    setAttachments([...attachments, file]);
  };

  const removeFile = (path: string) => {
    setAttachments(attachments.filter(att => att.filepath !== path));
  };

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled ? (
        <FormAnswerText answer={responses[0]?.answer} />
      ) : (
        <View style={styles.container}>
          <FilePicker multiple callback={file => addFile(new LocalFile(file, { _needIOSReleaseSecureAccess: false }))}>
            <View style={[styles.textIconContainer, filesAdded && styles.textIconContainerSmallerMargin]}>
              <SmallActionText style={styles.actionText}>{I18n.t('common.addFiles')}</SmallActionText>
              <Icon name="attachment" size={18} color={theme.palette.primary.regular} />
            </View>
          </FilePicker>
          <FlatList
            data={attachments}
            keyExtractor={attachment => attachment.filename}
            renderItem={({ item }) => (
              <Attachment name={item.filename} type={item.filetype} uploadSuccess onRemove={() => removeFile(item.filepath)} />
            )}
            bottomInset={false}
          />
        </View>
      )}
    </FormQuestionCard>
  );
};
