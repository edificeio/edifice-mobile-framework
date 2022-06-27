import I18n from 'i18n-js';
import * as React from 'react';
import { EmitterSubscription, Keyboard, Platform, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingFlatList } from 'react-native-keyboard-avoiding-scroll-view';

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
import { Text, TextBold, TextSemiBold, TextSizeStyle } from '~/framework/components/text';
import { UserType } from '~/framework/util/session';
import { HtmlContentView } from '~/ui/HtmlContentView';
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
  const flatListRef = React.useRef<typeof FlatList>();
  const flatListModalRef = React.useRef<typeof FlatList>();
  const modalBoxRef: { current: any } = React.createRef();
  const commentFieldRefs = React.useRef([]);
  const bottomEditorSheetRef: { current: any } = React.useRef();
  const [editedCommentId, setEditedCommentId] = React.useState<string>('');
  const [contentHeight, setContentHeight] = React.useState(0);
  const [viewHeight, setViewHeight] = React.useState(0);

  const usersTextMaxLines = 1;
  const word = schoolbookWord?.word;
  const report = schoolbookWord?.report;
  const schoolbookWordOwnerId = word?.ownerId;
  const schoolbookWordResponsesNumber = word?.respNumber;
  const isUserSchoolbookWordOwner = userId === schoolbookWordOwnerId;
  const isParent = userType === UserType.Relative;
  const isTeacher = userType === UserType.Teacher;
  const isStudent = userType === UserType.Student;
  const isAuthorOtherTeacher = isTeacher && !isUserSchoolbookWordOwner;
  const hasSingleRecipientForTeacher = getHasSingleRecipientForTeacher(report);
  const studentsForTeacher = getStudentsForTeacher(report)?.map(student => ({ id: student.owner, name: student.ownerName }));
  const reportByStudentForParent = getReportByStudentForParent(studentId, report);
  const isWordAcknowledgedForParent =
    reportByStudentForParent && getIsWordAcknowledgedForParent(userId, reportByStudentForParent?.acknowledgments);
  const isWordRepliedToForParent =
    reportByStudentForParent && getIsWordRepliedToForParent(userId, reportByStudentForParent?.responses);
  const isWordAcknowledgedForTeacher = getIsWordAcknowledgedForTeacher(word?.ackNumber, word?.total);
  const isWordAcknowledgedForStudent = getIsWordAcknowledgedForStudent(report[0]?.acknowledgments);
  const isWordAcknowledged =
    (isTeacher && isWordAcknowledgedForTeacher) ||
    (isStudent && isWordAcknowledgedForStudent) ||
    (isParent && isWordAcknowledgedForParent);
  const responses = isStudent ? report[0]?.responses : isParent ? reportByStudentForParent?.responses : undefined;
  const isBottomSheetVisible = isParent && (!isWordAcknowledged || (word?.reply && !isWordRepliedToForParent));
  const doesContentExceedView = contentHeight && viewHeight ? contentHeight > viewHeight : undefined;

  const scrollToEnd = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToOffset({
        offset: contentHeight,
      });
    }, 50);
  };
  const cardBottomEditorSheetRef = () => bottomEditorSheetRef?.current;
  const cardSelectedCommentFieldRef = () => commentFieldRefs[editedCommentId];
  React.useImperativeHandle(ref, () => ({
    scrollToEnd,
    cardBottomEditorSheetRef,
    cardSelectedCommentFieldRef,
  }));

  const showSubscriptionRef = React.useRef<EmitterSubscription>();
  React.useEffect(() => {
    showSubscriptionRef.current = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        const commentIndex = responses?.findIndex(r => r.id?.toString() === editedCommentId);
        if (commentIndex !== undefined && commentIndex > -1) {
          if (Platform.OS === 'ios') {
            flatListRef?.current?.scrollToIndex({
              index: commentIndex,
              viewPosition: 1,
              viewOffset: -UI_SIZES.spacing.medium,
            });
          }
        }
      }, 50);
    });
    return () => {
      showSubscriptionRef.current?.remove();
    };
  });

  const resourceView = React.useMemo(
    () => (
      <ResourceView
        style={{
          backgroundColor: theme.ui.background.card,
          borderBottomWidth: UI_SIZES.dimensions.width.tiny,
          borderBottomColor: theme.palette.grey.pearl,
          paddingBottom:
            UI_SIZES.spacing.tiny + (doesContentExceedView && isBottomSheetVisible ? UI_SIZES.radius.mediumPlus * 2 : 0),
        }}
        customHeaderStyle={{
          backgroundColor: theme.palette.grey.fog,
          paddingVertical: UI_SIZES.spacing.minor,
          borderBottomColor: theme.palette.grey.pearl,
          borderBottomWidth: UI_SIZES.dimensions.width.tiny,
        }}
        customHeaderIndicatorStyle={{ justifyContent: 'center' }}
        headerIndicator={
          isTeacher ? (
            <TouchableOpacity style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }} onPress={action}>
              <TextSemiBold style={{ color: theme.palette.primary.regular }}>
                {acknowledgementsString(word?.ackNumber, word?.total)}
              </TextSemiBold>
              <Picture
                cached
                type="NamedSvg"
                name="pictos-arrow-right"
                width={UI_SIZES.dimensions.width.large}
                height={UI_SIZES.dimensions.height.large}
                fill={theme.palette.primary.regular}
                style={{ marginLeft: UI_SIZES.spacing.minor }}
              />
            </TouchableOpacity>
          ) : null
        }
        header={
          <TouchableOpacity
            disabled={!isTeacher || hasSingleRecipientForTeacher}
            onPress={() => {
              modalBoxRef?.current?.doShowModal();
              setTimeout(() => {
                console.log(flatListModalRef?.current);
                flatListModalRef?.current?.flashScrollIndicators();
              });
            }}>
            <ContentCardHeader
              icon={
                <SingleAvatar
                  size={36}
                  userId={
                    isTeacher
                      ? hasSingleRecipientForTeacher
                        ? report[0]?.owner
                        : require('ASSETS/images/group-avatar.png')
                      : word?.ownerId
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
                    {isTeacher ? recipientsString(report) : word?.ownerName}
                  </TextSemiBold>
                </Text>
              }
              date={word?.sendingDate}
            />
          </TouchableOpacity>
        }
        footer={
          isTeacher && schoolbookWordResponsesNumber ? (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: UI_SIZES.spacing.minor,
                marginVertical: -UI_SIZES.spacing.minor,
              }}
              onPress={action}>
              <Picture
                cached
                type="NamedSvg"
                name="pictos-answer"
                width={UI_SIZES.dimensions.width.large}
                height={UI_SIZES.dimensions.height.large}
                fill={theme.palette.primary.regular}
                style={{ marginRight: UI_SIZES.spacing.minor }}
              />
              <TextSemiBold style={{ color: theme.palette.primary.regular }}>
                {responsesString(schoolbookWordResponsesNumber)}
              </TextSemiBold>
            </TouchableOpacity>
          ) : undefined
        }>
        {isAuthorOtherTeacher ? (
          <View style={{ marginTop: UI_SIZES.spacing.medium, flexDirection: 'row', alignItems: 'center' }}>
            <SingleAvatar size={36} userId={word?.ownerId} />
            <Text style={{ flex: 1, marginLeft: UI_SIZES.spacing.minor }} numberOfLines={usersTextMaxLines}>
              {`${I18n.t('common.from')} `}
              <TextSemiBold>{word?.ownerName}</TextSemiBold>
            </Text>
          </View>
        ) : !isTeacher && !isWordAcknowledged ? (
          <TextSemiBold style={{ marginTop: UI_SIZES.spacing.small, alignSelf: 'center', color: theme.palette.status.warning }}>
            {unacknowledgedString(userType)}
          </TextSemiBold>
        ) : null}
        {word?.category ? (
          <View
            style={{
              marginTop: isAuthorOtherTeacher ? UI_SIZES.spacing.medium : UI_SIZES.spacing.large,
            }}>
            <ImageLabel
              cachedSVG
              text={I18n.t(`schoolbook.categories.${word?.category}`)}
              imageName={`schoolbook-${word?.category}`}
              imageType={ImageType.svg}
              color={theme.color.schoolbook.categories[word?.category]}
            />
          </View>
        ) : null}
        {word?.title ? (
          <TextBold style={{ marginTop: UI_SIZES.spacing.small, ...TextSizeStyle.SlightBigPlus }}>{word?.title}</TextBold>
        ) : null}
        {word?.text ? (
          <View style={{ marginTop: UI_SIZES.spacing.minor, marginBottom: UI_SIZES.spacing.small }}>
            <HtmlContentView html={word?.text} opts={{ globalTextStyle: { ...TextSizeStyle.SlightBig } }} />
          </View>
        ) : null}
      </ResourceView>
    ),
    [
      action,
      doesContentExceedView,
      hasSingleRecipientForTeacher,
      isAuthorOtherTeacher,
      isTeacher,
      isWordAcknowledged,
      modalBoxRef,
      report,
      schoolbookWordResponsesNumber,
      userType,
      word?.ackNumber,
      word?.category,
      word?.ownerId,
      word?.ownerName,
      word?.sendingDate,
      word?.title,
      word?.total,
    ],
  );

  const ListComponent = Platform.select<typeof FlatList | typeof KeyboardAvoidingFlatList>({
    ios: FlatList,
    android: KeyboardAvoidingFlatList,
  })!;

  return (
    <>
      <ListComponent
        ref={ref => {
          flatListRef.current = ref;
        }}
        onContentSizeChange={(width, height) => {
          setContentHeight(height);
        }}
        removeClippedSubviews={false}
        data={word?.reply && responses ? responses : []}
        renderItem={({ item, index }) => {
          const isFirstItem = index === 0;
          return (
            <View style={{ marginTop: isFirstItem ? UI_SIZES.spacing.medium : undefined }}>
              <CommentField
                ref={element => (commentFieldRefs[item.id] = element)}
                index={index}
                isPublishingComment={isPublishingReply}
                onPublishComment={(comment, commentId) => onPublishReply(comment, commentId)}
                editCommentCallback={() => {
                  const otherSchoolbookWordResponses = responses?.filter(response => response.id !== item.id);
                  setEditedCommentId(item.id?.toString());
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
            </View>
          );
        }}
        keyExtractor={item => item.id?.toString()}
        ListHeaderComponent={resourceView}
        onLayout={({ nativeEvent }) => setViewHeight(nativeEvent?.layout?.height)}
        keyboardShouldPersistTaps="handled"
        bottomInset={!isBottomSheetVisible}
        style={{ marginBottom: doesContentExceedView && isBottomSheetVisible ? -UI_SIZES.radius.mediumPlus : undefined }}
        scrollIndicatorInsets={{
          right: 0.001,
          bottom: doesContentExceedView && isBottomSheetVisible ? UI_SIZES.radius.mediumPlus : undefined,
        }}
      />
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
          <View style={{ flexGrow: 1, flexShrink: 1 }}>
            <TextSemiBold style={{ ...TextSizeStyle.SlightBigPlus, marginBottom: UI_SIZES.spacing.tiny }}>
              {I18n.t('schoolbook.schoolbookWordDetailsScreen.recipientsModal.title')}
            </TextSemiBold>
            <Text style={{ marginBottom: UI_SIZES.spacing.medium, color: theme.palette.grey.graphite }}>
              {I18n.t('schoolbook.schoolbookWordDetailsScreen.recipientsModal.text')}
            </Text>
            <UserList
              ref={flatListModalRef}
              data={studentsForTeacher}
              avatarSize={24}
              contentContainerStyle={{ flexGrow: 1 }}
              initialNumToRender={15}
              viewabilityConfig={{
                waitForInteraction: false,
                viewAreaCoveragePercentThreshold: 0,
                minimumViewTime: -1,
              }}
              alwaysBounceVertical={false}
              persistentScrollbar
              showsVerticalScrollIndicator
            />
          </View>
        }
      />
    </>
  );
};

export default React.forwardRef(SchoolbookWordDetailsCard);
