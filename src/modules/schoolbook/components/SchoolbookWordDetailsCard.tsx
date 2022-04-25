import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { BottomButtonSheet } from '~/framework/components/BottomButtonSheet';
import { BottomEditorSheet } from '~/framework/components/BottomEditorSheet';
import ModalBox from '~/framework/components/ModalBox';
import UserList from '~/framework/components/UserList';
import { ContentCardHeader, ResourceView } from '~/framework/components/card';
import CommentField from '~/framework/components/commentField';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import { ImageLabel, ImageType } from '~/framework/components/imageLabel';
import Label from '~/framework/components/label';
import ScrollView from '~/framework/components/scrollView';
import { Text, TextBold, TextSemiBold, TextSizeStyle } from '~/framework/components/text';
import { extractMediaFromHtml, extractTextFromHtml, renderMediaPreview } from '~/framework/util/htmlParser/content';
import { UserType } from '~/framework/util/session';
import { isStringEmpty } from '~/framework/util/string';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import {
  IConcernedStudent,
  IWordReport,
  getHasSingleRecipientForTeacher,
  getIsWordAcknowledgedForParent,
  getIsWordAcknowledgedForStudent,
  getIsWordAcknowledgedForTeacher,
  getIsWordRepliedToForParent,
  getReportByStudentForParent,
  getStudentsForTeacher,
} from '../reducer';

const acknowledgementsString = (ackNumber: number, total: number) =>
  `${ackNumber}/${total} ${I18n.t(`schoolbook.acknowledgement${total === 1 ? '' : 's'}`).toLowerCase()}`;
const unacknowledgedString = (userType: UserType) => I18n.t(`schoolbook.acknowledgementNeeded${userType}`);
const recipientsString = (report: IConcernedStudent[]) =>
  getHasSingleRecipientForTeacher(report) ? report[0].ownerName : `${report.length} ${I18n.t('schoolbook.students').toLowerCase()}`;

export interface ISchoolBookWordDetailsCardProps {
  action: () => void;
  onPublishReply: (comment: string, commentId?: string) => any;
  isPublishingReply: boolean;
  userType: UserType;
  userId: string;
  studentId: string;
  schoolbookWord: IWordReport;
}

export const SchoolbookWordDetailsCard = ({
  action,
  onPublishReply,
  isPublishingReply,
  userType,
  userId,
  studentId,
  schoolbookWord,
}: ISchoolBookWordDetailsCardProps) => {
  const modalBoxRef: { current: any } = React.createRef();
  const usersTextMaxLines = 1;
  const word = schoolbookWord.word;
  const report = schoolbookWord.report;
  const schoolbookWordText = extractTextFromHtml(word.text);
  const schoolbookWordMedia = extractMediaFromHtml(word.text);
  const hasSchoolbookWordText = schoolbookWordText && !isStringEmpty(schoolbookWordText);
  const hasSchoolbookWordMedia = schoolbookWordMedia?.length;
  const isParent = userType === UserType.Relative;
  const isTeacher = userType === UserType.Teacher;
  const isStudent = userType === UserType.Student;
  const hasSingleRecipientForTeacher = getHasSingleRecipientForTeacher(report);
  const studentsForTeacher = getStudentsForTeacher(report)?.map(student => ({ id: student.owner, name: student.ownerName }));
  const reportByStudentForParent = getReportByStudentForParent(studentId, schoolbookWord.report);
  const isWordAcknowledgedForParent =
    reportByStudentForParent && getIsWordAcknowledgedForParent(userId, reportByStudentForParent?.acknowledgments);
  const isWordRepliedToForParent =
    reportByStudentForParent && getIsWordRepliedToForParent(userId, reportByStudentForParent?.responses);
  const isWordAcknowledgedForTeacher = getIsWordAcknowledgedForTeacher(word.ackNumber, word.total);
  const isWordAcknowledgedForStudent = getIsWordAcknowledgedForStudent(report[0]?.acknowledgments);
  const isWordAcknowledged =
    (isTeacher && isWordAcknowledgedForTeacher) ||
    (isStudent && isWordAcknowledgedForStudent) ||
    (isParent && isWordAcknowledgedForParent);
  const responses = isStudent ? report[0]?.responses : isParent ? reportByStudentForParent?.responses : undefined;
  const isBottomSheetVisible = isTeacher || (isParent && (!isWordAcknowledged || (word.reply && !isWordRepliedToForParent)));

  return (
    <>
      <ScrollView bottomInset={!isBottomSheetVisible}>
        <ResourceView
          style={{
            backgroundColor: theme.color.background.card,
            borderBottomWidth: UI_SIZES.dimensions.width.tiny,
            borderBottomColor: theme.greyPalette.pearl,
            paddingBottom: UI_SIZES.spacing.extraSmall,
          }}
          emphasizedHeader
          customHeaderStyle={{ paddingVertical: UI_SIZES.spacing.smallPlus }}
          customHeaderIndicatorStyle={{ justifyContent: 'center' }}
          headerIndicator={
            isTeacher ? (
              <Label
                text={acknowledgementsString(word.ackNumber, word.total)}
                color={isWordAcknowledged ? theme.schoolbook.acknowledged : theme.schoolbook.acknowledge}
                labelStyle="outline"
              />
            ) : null
          }
          header={
            <TouchableOpacity
              disabled={!isTeacher || hasSingleRecipientForTeacher}
              onPress={() => modalBoxRef?.current?.doShowModal()}>
              <ContentCardHeader
                icon={
                  <SingleAvatar
                    size={24}
                    userId={
                      isTeacher
                        ? hasSingleRecipientForTeacher
                          ? report[0]?.owner
                          : require('ASSETS/images/group-avatar.png')
                        : word.ownerId
                    }
                  />
                }
                text={
                  <Text style={{ ...TextSizeStyle.Small }} numberOfLines={usersTextMaxLines}>
                    {`${I18n.t(`common.${isTeacher ? 'to' : 'from'}`)} `}
                    <TextSemiBold
                      style={{
                        ...TextSizeStyle.Small,
                        color:
                          !isTeacher || hasSingleRecipientForTeacher ? theme.color.text.regular : theme.color.secondary.regular,
                      }}>
                      {isTeacher ? recipientsString(report) : word.ownerName}
                    </TextSemiBold>
                  </Text>
                }
                date={word.sendingDate}
              />
            </TouchableOpacity>
          }>
          {!isTeacher && !isWordAcknowledged ? (
            <TextSemiBold style={{ marginTop: UI_SIZES.spacing.medium, alignSelf: 'center', color: theme.color.secondary.regular }}>
              {unacknowledgedString(userType)}
            </TextSemiBold>
          ) : null}
          {word.category ? (
            <View style={{ marginTop: UI_SIZES.spacing.large }}>
              <ImageLabel
                text={I18n.t(`schoolbook.categories.${word.category}`)}
                imageName={`schoolbook-${word.category}`}
                imageType={ImageType.svg}
                color={theme.schoolbook.categories[word.category]}
              />
            </View>
          ) : null}
          {word.title ? (
            <TextBold style={{ marginTop: UI_SIZES.spacing.mediumPlus, ...TextSizeStyle.SlightBigPlus }}>{word.title}</TextBold>
          ) : null}
          {hasSchoolbookWordText ? (
            <Text style={{ marginTop: UI_SIZES.spacing.smallPlus, ...TextSizeStyle.SlightBig }}>{schoolbookWordText}</Text>
          ) : null}
          {hasSchoolbookWordMedia ? (
            <View style={{ marginTop: UI_SIZES.spacing.extraSmall }}>{renderMediaPreview(schoolbookWordMedia)}</View>
          ) : null}
        </ResourceView>
        {word.reply && responses ? (
          <FlatList
            bottomInset={false}
            style={{ marginTop: UI_SIZES.spacing.large }}
            data={responses}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item, index }) => (
              <CommentField
                index={index}
                placeholder={I18n.t('common.comment.addReply')}
                isPublishingComment={isPublishingReply}
                onPublishComment={(comment, commentId) => onPublishReply(comment, commentId)}
                comment={item.comment}
                commentId={item.id}
                commentAuthorId={item.owner}
                commentAuthor={item.parentName}
                commentDate={item.modified}
              />
            )}
          />
        ) : null}
      </ScrollView>
      {isTeacher ? (
        <BottomButtonSheet text={I18n.t('schoolbook.wordFollowUp')} iconName={'pictos-arrow-right'} action={action} />
      ) : isParent ? (
        !isWordAcknowledged ? (
          <BottomButtonSheet text={I18n.t('schoolbook.acknowledge')} action={action} />
        ) : word.reply && !isWordRepliedToForParent ? (
          <BottomEditorSheet
            placeholder={I18n.t('common.comment.addReply')}
            isPublishingComment={isPublishingReply}
            onPublishComment={comment => onPublishReply(comment)}
          />
        ) : null
      ) : null}
      <ModalBox
        ref={modalBoxRef}
        content={
          <View style={{ flex: 1 }}>
            <TextSemiBold style={{ ...TextSizeStyle.SlightBig, marginBottom: UI_SIZES.spacing.extraSmall }}>
              {I18n.t('schoolbook.schoolbookWordDetailsScreen.recipientsModal.title')}
            </TextSemiBold>
            <Text style={{ marginBottom: UI_SIZES.spacing.largePlus, color: theme.greyPalette.graphite }}>
              {I18n.t('schoolbook.schoolbookWordDetailsScreen.recipientsModal.text')}
            </Text>
            <UserList data={studentsForTeacher} avatarSize={24} />
          </View>
        }
      />
    </>
  );
};
