import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { FormAnswerText } from './FormAnswerText';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { cameraAction, documentAction, DocumentPicked, galleryAction } from '~/framework/components/menus/actions';
import BottomMenu from '~/framework/components/menus/bottom';
import { Svg } from '~/framework/components/picture';
import { SmallActionText } from '~/framework/components/text';
import { FormQuestionCard } from '~/framework/modules/form/components/FormQuestionCard';
import { IQuestion, IQuestionResponse, IResponseFile } from '~/framework/modules/form/model';
import { Attachment } from '~/framework/modules/zimbra/components/Attachment';
import { LocalFile } from '~/framework/util/fileHandler';
import { Asset } from '~/framework/util/fileHandler/types';

const styles = StyleSheet.create({
  actionText: {
    marginRight: UI_SIZES.spacing.minor,
    textAlign: 'center',
  },
  container: {
    backgroundColor: theme.ui.background.card,
    borderColor: theme.ui.border.input,
    borderRadius: 5,
    borderWidth: 1,
  },
  textIconContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginRight: UI_SIZES.spacing.minor,
    marginVertical: UI_SIZES.spacing.big,
  },
  textIconContainerSmallerMargin: {
    marginVertical: UI_SIZES.spacing.small,
  },
});

interface IFormFileCardProps {
  isDisabled: boolean;
  question: IQuestion;
  responses: IQuestionResponse[];
  onChangeAnswer: (questionId: number, newResponses: IQuestionResponse[]) => void;
  onEditQuestion?: () => void;
}

export const FormFileCard = ({ isDisabled, onChangeAnswer, onEditQuestion, question, responses }: IFormFileCardProps) => {
  const [files, setFiles] = React.useState<IResponseFile[]>(responses[0]?.files ?? []);
  const { mandatory, title } = question;
  const filesAdded = files.length > 0;

  React.useEffect(() => {
    const answer = files.length ? 'Fichier déposé' : '';

    if (responses.length) {
      responses[0].answer = answer;
      responses[0].files = files;
    } else {
      responses.push({
        answer,
        files,
        questionId: question.id,
      });
    }
    onChangeAnswer(question.id, responses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const filePickedToLocalFile = (img: Asset | DocumentPicked): LocalFile =>
    new LocalFile(
      {
        filename: img.fileName ?? 'unknown',
        filepath: img.uri!,
        filetype: img.type ?? 'application/octet-stream',
      },
      { _needIOSReleaseSecureAccess: false },
    );

  const addFile = (fileOrFiles: Asset | DocumentPicked | (Asset | DocumentPicked)[]) => {
    const fls = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
    const newFiles: IResponseFile[] = fls.map(f => {
      const lf = filePickedToLocalFile(f);
      return {
        filename: lf.filename,
        id: null,
        lf,
        responseId: 0,
        type: lf.filetype,
      };
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (file: IResponseFile) => {
    setFiles(files.filter(a => a !== file));
  };

  return (
    <FormQuestionCard title={title} isMandatory={mandatory} onEditQuestion={onEditQuestion}>
      {isDisabled ? (
        <FormAnswerText answer={responses[0]?.answer ? files.map(a => a.filename).join('\n') : undefined} />
      ) : (
        <View style={styles.container}>
          <BottomMenu
            title={I18n.get('form-distribution-filecard-addfiles')}
            actions={[
              cameraAction({ callback: file => addFile(file) }),
              galleryAction({ callback: file => addFile(file), multiple: true }),
              documentAction({ callback: file => addFile(file) }),
            ]}>
            <View style={[styles.textIconContainer, filesAdded && styles.textIconContainerSmallerMargin]}>
              <SmallActionText style={styles.actionText}>{I18n.get('form-distribution-filecard-addfiles')}</SmallActionText>
              <Svg name="ui-attachment" width={18} height={18} fill={theme.palette.primary.regular} />
            </View>
          </BottomMenu>
          <FlatList
            data={files}
            keyExtractor={attachment => attachment.filename}
            renderItem={({ item }) => <Attachment name={item.filename} type={item.type} onRemove={() => removeFile(item)} />}
          />
        </View>
      )}
    </FormQuestionCard>
  );
};
