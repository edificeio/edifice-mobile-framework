import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { BottomButtonSheet } from '~/framework/components/BottomButtonSheet';
import BottomEditorSheet from '~/framework/components/BottomEditorSheet';
import ModalBox from '~/framework/components/ModalBox';
import UserList from '~/framework/components/UserList';
import { ContentCardHeader, ResourceView } from '~/framework/components/card';
import CommentField from '~/framework/components/commentField';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import { ImageLabel, ImageType } from '~/framework/components/imageLabel';
import { Picture } from '~/framework/components/picture';
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
  `${ackNumber}/${total} ${I18n.t(`schoolbook.acknowledgement${ackNumber === 1 ? '' : 's'}`).toLowerCase()}`;
const unacknowledgedString = (userType: UserType) => I18n.t(`schoolbook.acknowledgementNeeded${userType}`);
const recipientsString = (report: IConcernedStudent[]) =>
  getHasSingleRecipientForTeacher(report) ? report[0].ownerName : `${report.length} ${I18n.t('schoolbook.students').toLowerCase()}`;
const responsesString = (responses: number) =>
  responses === 1
    ? `1 ${I18n.t('schoolbook.response').toLowerCase()}`
    : `${responses} ${I18n.t('schoolbook.responses').toLowerCase()}`;

export interface ISchoolBookWordDetailsCardProps {
  action: () => void;
  onPublishReply: (comment: string, commentId?: string) => any;
  isPublishingReply: boolean;
  userType: UserType;
  userId: string;
  studentId: string;
  schoolbookWord: IWordReport;
}

const SchoolbookWordDetailsCard = (
  { action, onPublishReply, isPublishingReply, userType, userId, studentId, schoolbookWord }: ISchoolBookWordDetailsCardProps,
  ref,
) => {
  const scrollViewRef: { current: any } = React.createRef();
  const modalBoxRef: { current: any } = React.createRef();
  const commentFieldRefs = React.useRef([]);
  const bottomEditorSheetRef: { current: any } = React.useRef();
  const [editedCommentId, setEditedCommentId] = React.useState<string>('');
  const [contentHeight, setContentHeight] = React.useState(0);
  const [viewHeight, setViewHeight] = React.useState(0);

  const usersTextMaxLines = 1;
  const word = schoolbookWord.word;
  const report = schoolbookWord.report;
  const schoolbookWordText = extractTextFromHtml(word.text);
  const schoolbookWordMedia = extractMediaFromHtml(word.text);
  const hasSchoolbookWordText = schoolbookWordText && !isStringEmpty(schoolbookWordText);
  const hasSchoolbookWordMedia = schoolbookWordMedia?.length;
  const schoolbookWordOwnerId = word?.ownerId;
  const schoolbookWordResponsesNumber = word?.respNumber;
  const isUserSchoolbookWordOwner = userId === schoolbookWordOwnerId;
  const isParent = userType === UserType.Relative;
  const isTeacher = userType === UserType.Teacher;
  const isStudent = userType === UserType.Student;
  const isAuthorOtherTeacher = isTeacher && !isUserSchoolbookWordOwner;
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
  const isBottomSheetVisible = isParent && (!isWordAcknowledged || (word.reply && !isWordRepliedToForParent));
  const doesContentExceedView = contentHeight && viewHeight ? contentHeight >= viewHeight : undefined;

  const scrollToEnd = () => scrollViewRef?.current?.scrollToEnd();
  const cardBottomEditorSheetRef = () => bottomEditorSheetRef?.current;
  const cardSelectedCommentFieldRef = () => commentFieldRefs[editedCommentId];
  React.useImperativeHandle(ref, () => ({
    scrollToEnd,
    cardBottomEditorSheetRef,
    cardSelectedCommentFieldRef,
  }));

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        onLayout={({ nativeEvent }) => setViewHeight(nativeEvent.layout.height)}
        onContentSizeChange={(width, height) => setContentHeight(height)}
        keyboardShouldPersistTaps="handled"
        bottomInset={!isBottomSheetVisible}
        scrollIndicatorInsets={{ right: 0.001, bottom: doesContentExceedView ? UI_SIZES.radius.mediumPlus : undefined }}
        style={{ marginBottom: doesContentExceedView ? -UI_SIZES.radius.mediumPlus : undefined }}>
        <ResourceView
          style={{
            backgroundColor: theme.ui.background.card,
            borderBottomWidth: UI_SIZES.dimensions.width.tiny,
            borderBottomColor: theme.palette.grey.pearl,
            paddingBottom: UI_SIZES.spacing.extraSmall + (doesContentExceedView ? UI_SIZES.radius.mediumPlus : 0),
          }}
          emphasizedHeader
          customHeaderStyle={{ paddingVertical: UI_SIZES.spacing.smallPlus }}
          customHeaderIndicatorStyle={{ justifyContent: 'center' }}
          headerIndicator={
            isTeacher ? (
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={action}>
                <TextSemiBold style={{ color: theme.palette.primary.regular }}>
                  {acknowledgementsString(word.ackNumber, word.total)}
                </TextSemiBold>
                <Picture
                  type="NamedSvg"
                  name="pictos-arrow-right"
                  width={UI_SIZES.dimensions.width.large}
                  height={UI_SIZES.dimensions.height.large}
                  fill={theme.palette.primary.regular}
                  style={{ marginLeft: UI_SIZES.spacing.smallPlus }}
                />
              </TouchableOpacity>
            ) : null
          }
          header={
            <TouchableOpacity
              disabled={!isTeacher || hasSingleRecipientForTeacher}
              onPress={() => modalBoxRef?.current?.doShowModal()}>
              <ContentCardHeader
                icon={
                  <SingleAvatar
                    size={36}
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
                    {`${I18n.t(`common.${isTeacher ? 'forRecipients' : 'from'}`)} `}
                    <TextSemiBold
                      style={{
                        ...TextSizeStyle.Small,
                        color: !isTeacher || hasSingleRecipientForTeacher ? theme.ui.text.regular : theme.palette.primary.regular,
                      }}>
                      {isTeacher ? recipientsString(report) : word.ownerName}
                    </TextSemiBold>
                  </Text>
                }
                date={word.sendingDate}
              />
            </TouchableOpacity>
          }
          footer={
            isTeacher && schoolbookWordResponsesNumber ? (
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={action}>
                <Picture
                  type="NamedSvg"
                  name="pictos-answer"
                  width={UI_SIZES.dimensions.width.large}
                  height={UI_SIZES.dimensions.height.large}
                  fill={theme.palette.primary.regular}
                  style={{ marginRight: UI_SIZES.spacing.smallPlus }}
                />
                <TextSemiBold style={{ color: theme.palette.primary.regular }}>
                  {responsesString(schoolbookWordResponsesNumber)}
                </TextSemiBold>
              </TouchableOpacity>
            ) : undefined
          }>
          {isAuthorOtherTeacher ? (
            <View style={{ marginTop: UI_SIZES.spacing.large, flexDirection: 'row', alignItems: 'center' }}>
              <SingleAvatar size={36} userId={word.ownerId} />
              <Text style={{ flex: 1, marginLeft: UI_SIZES.spacing.smallPlus }} numberOfLines={usersTextMaxLines}>
                {`${I18n.t('common.from')} `}
                <TextSemiBold>{word.ownerName}</TextSemiBold>
              </Text>
            </View>
          ) : !isTeacher && !isWordAcknowledged ? (
            <TextSemiBold style={{ marginTop: UI_SIZES.spacing.medium, alignSelf: 'center', color: theme.palette.status.warning }}>
              {unacknowledgedString(userType)}
            </TextSemiBold>
          ) : null}
          {word.category ? (
            <View style={{ marginTop: UI_SIZES.spacing[isAuthorOtherTeacher ? 'medium' : 'large'] }}>
              <ImageLabel
                text={I18n.t(`schoolbook.categories.${word.category}`)}
                imageName={`schoolbook-${word.category}`}
                imageType={ImageType.svg}
                color={theme.color.schoolbook.categories[word.category]}
              />
            </View>
          ) : null}
          {word.title ? (
            <TextBold style={{ marginTop: UI_SIZES.spacing.medium, ...TextSizeStyle.SlightBigPlus }}>{word.title}</TextBold>
          ) : null}
          {hasSchoolbookWordText ? (
            <Text
              style={{ marginTop: UI_SIZES.spacing.smallPlus, marginBottom: UI_SIZES.spacing.tiny, ...TextSizeStyle.SlightBig }}>
              {schoolbookWordText}
            </Text>
          ) : null}
          {hasSchoolbookWordMedia ? (
            <View style={{ marginVertical: UI_SIZES.spacing.tiny }}>{renderMediaPreview(schoolbookWordMedia)}</View>
          ) : null}
        </ResourceView>
        {word.reply && responses ? (
          <FlatList
            bottomInset={false}
            keyboardShouldPersistTaps="handled"
            style={{ marginTop: UI_SIZES.spacing.large }}
            data={responses}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item, index }) => (
              <CommentField
                ref={element => (commentFieldRefs[item.id] = element)}
                index={index}
                isPublishingComment={isPublishingReply}
                onPublishComment={(comment, commentId) => onPublishReply(comment, commentId)}
                editCommentCallback={() => {
                  const otherSchoolbookWordResponses = responses?.filter(response => response.id !== item.id);
                  setEditedCommentId(item.id.toString());
                  otherSchoolbookWordResponses?.forEach(otherSchoolbookWordResponse => {
                    commentFieldRefs[otherSchoolbookWordResponse.id]?.setIsEditingFalse();
                  });
                }}
                comment={item.comment}
                commentId={item.id}
                commentAuthorId={item.owner}
                commentAuthor={item.parentName}
                commentDate={item.modified}
                isResponse
              />
            )}
          />
        ) : null}
      </ScrollView>
      {isParent ? (
        !isWordAcknowledged ? (
          <BottomButtonSheet displayShadow={doesContentExceedView} text={I18n.t('schoolbook.acknowledge')} action={action} />
        ) : word.reply && !isWordRepliedToForParent ? (
          <BottomEditorSheet
            ref={bottomEditorSheetRef}
            displayShadow={doesContentExceedView}
            isPublishingComment={isPublishingReply}
            onPublishComment={comment => onPublishReply(comment)}
            isResponse
          />
        ) : null
      ) : null}
      <ModalBox
        ref={modalBoxRef}
        content={
          <View style={{ flex: 1 }}>
            <TextSemiBold style={{ ...TextSizeStyle.SlightBigPlus, marginBottom: UI_SIZES.spacing.extraSmall }}>
              {I18n.t('schoolbook.schoolbookWordDetailsScreen.recipientsModal.title')}
            </TextSemiBold>
            <Text style={{ marginBottom: UI_SIZES.spacing.large, color: theme.palette.grey.graphite }}>
              {I18n.t('schoolbook.schoolbookWordDetailsScreen.recipientsModal.text')}
            </Text>
            <UserList data={studentsForTeacher} avatarSize={24} />
          </View>
        }
      />
    </>
  );
};

export default React.forwardRef(SchoolbookWordDetailsCard);
