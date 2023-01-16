import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import ModalBox from '~/framework/components/ModalBox';
import UserList from '~/framework/components/UserList';
import { ActionButton } from '~/framework/components/action-button';
import { ResourceView } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import ScrollView from '~/framework/components/scrollView';
import {
  BodyText,
  CaptionBoldText,
  CaptionItalicText,
  CaptionText,
  HeadingSText,
  SmallBoldText,
  SmallText,
} from '~/framework/components/text';
import { displayPastDate } from '~/framework/util/date';
import { IUserSession } from '~/framework/util/session';
import { IAcknowledgment, IWordReport, getStudentsByAcknowledgementForTeacher } from '~/modules/schoolbook/reducer';
import { hasResendRight } from '~/modules/schoolbook/rights';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

const acknowledgementsString = (ackNumber: number, total: number) =>
  `${ackNumber}/${total} ${I18n.t(`schoolbook.acknowledgement${ackNumber === 1 ? '' : 's'}`).toLowerCase()}`;
const unacknowledgementsString = (ackNumber: number, total: number) =>
  `${total - ackNumber}/${total} ${I18n.t(
    `schoolbook.schoolbookWordReportScreen.unacknowledgement${total - ackNumber === 1 ? '' : 's'}`,
  ).toLowerCase()}`;
const acknowledgedByString = (acknowledgments: IAcknowledgment[]) =>
  `${I18n.t('schoolbook.schoolbookWordReportScreen.acknowledgedBy')}${acknowledgments?.map(
    acknowledgment => ` ${acknowledgment.parentName}`,
  )}`;

export interface ISchoolBookWordReportCardProps {
  session: IUserSession;
  action: () => void;
  schoolbookWord: IWordReport;
}

const SchoolbookWordReportCard = ({ session, action, schoolbookWord }: ISchoolBookWordReportCardProps, ref) => {
  const modalBoxRef: { current: any } = React.createRef();

  const acknowledgedByTextMaxLines = 1;
  const word = schoolbookWord?.word;
  const report = schoolbookWord?.report;
  const studentsByAcknowledgementForTeacher = getStudentsByAcknowledgementForTeacher(report);
  const unacknowledgedStudents = studentsByAcknowledgementForTeacher?.unacknowledged?.map(student => ({
    id: student.owner,
    name: student.ownerName,
  }));
  const acknowledgedStudents = studentsByAcknowledgementForTeacher?.acknowledged;
  const hasUnacknowledgedStudents = unacknowledgedStudents?.length;
  const hasAcknowledgedStudents = acknowledgedStudents?.length;
  const schoolbookWordResource = { shared: word?.shared, author: { userId: word?.ownerId } };
  const hasSchoolbookWordResendRights = hasResendRight(schoolbookWordResource, session);

  const cardModalBoxRef = () => modalBoxRef?.current;
  React.useImperativeHandle(ref, () => ({ cardModalBoxRef }));

  return (
    <>
      <ScrollView>
        <ResourceView>
          {hasAcknowledgedStudents ? (
            <>
              <HeadingSText
                style={{
                  marginTop: UI_SIZES.spacing.tiny,
                }}>
                {acknowledgementsString(word?.ackNumber, word?.total)}
              </HeadingSText>
              <SmallText style={{ marginTop: UI_SIZES.spacing.minor }}>
                {I18n.t('schoolbook.schoolbookWordReportScreen.relativesDidAcknowledge')}
              </SmallText>
              <FlatList
                bottomInset={false}
                style={SchoolbookWordReportCard.Style.list}
                contentContainerStyle={{ backgroundColor: theme.ui.background.card, borderRadius: UI_SIZES.radius.medium }}
                data={acknowledgedStudents}
                initialNumToRender={acknowledgedStudents.length}
                keyExtractor={item => item.owner}
                renderItem={({ item, index }) => {
                  const isLastItem = index === acknowledgedStudents?.length - 1;
                  return (
                    <View
                      style={{
                        paddingVertical: UI_SIZES.spacing.small,
                        paddingHorizontal: UI_SIZES.spacing.medium,
                        borderBottomWidth: isLastItem ? 0 : 1,
                        borderBottomColor: theme.palette.grey.cloudy,
                      }}>
                      <View style={{ flexDirection: 'row' }}>
                        <SingleAvatar size={24} userId={item.owner} />
                        <View style={{ flex: 1, marginLeft: UI_SIZES.spacing.minor }}>
                          <SmallText numberOfLines={1}>{item.ownerName}</SmallText>
                          <CaptionText numberOfLines={acknowledgedByTextMaxLines} style={{ color: theme.palette.grey.graphite }}>
                            {acknowledgedByString(item.acknowledgments)}
                          </CaptionText>
                          {item.responses?.map((response, index) => {
                            const isLastItem = item.responses && item.responses.length - 1 === index;
                            return (
                              <View
                                style={{
                                  backgroundColor: theme.palette.grey.fog,
                                  borderRadius: UI_SIZES.radius.medium,
                                  borderWidth: 1,
                                  borderColor: theme.palette.grey.cloudy,
                                  padding: UI_SIZES.spacing.minor,
                                  marginVertical: UI_SIZES.spacing.tiny,
                                  marginBottom: isLastItem ? 0 : UI_SIZES.spacing.tiny,
                                }}>
                                <View style={{ flexDirection: 'row' }}>
                                  <SingleAvatar size={24} userId={response.owner} />
                                  <View style={{ flex: 1, marginLeft: UI_SIZES.spacing.minor }}>
                                    <View style={{ flexDirection: 'row' }}>
                                      <CaptionBoldText numberOfLines={1} style={{ flexShrink: 1 }}>
                                        {response.parentName}
                                      </CaptionBoldText>
                                      <CaptionItalicText
                                        style={{
                                          marginLeft: UI_SIZES.spacing.minor,
                                          color: theme.palette.grey.graphite,
                                        }}>
                                        {displayPastDate(response.modified)}
                                      </CaptionItalicText>
                                    </View>
                                    <CaptionText>{response.comment}</CaptionText>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            </>
          ) : null}
          {hasUnacknowledgedStudents ? (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: hasAcknowledgedStudents ? UI_SIZES.spacing.tiny + UI_SIZES.spacing.medium : UI_SIZES.spacing.tiny,
                }}>
                <HeadingSText>{unacknowledgementsString(word?.ackNumber, word?.total)}</HeadingSText>
                {hasSchoolbookWordResendRights ? (
                  <ActionButton
                    type="secondary"
                    text={I18n.t('schoolbook.schoolbookWordReportScreen.reminder')}
                    iconName="pictos-send"
                    action={() => modalBoxRef?.current?.doShowModal()}
                  />
                ) : null}
              </View>
              <SmallText style={{ marginTop: UI_SIZES.spacing.minor }}>
                {`${I18n.t('schoolbook.schoolbookWordReportScreen.relativesDidNotAcknowledge')}${
                  hasSchoolbookWordResendRights ? ' ' + I18n.t('schoolbook.schoolbookWordReportScreen.reminderPossible') : ''
                }`}
              </SmallText>
              <UserList
                data={unacknowledgedStudents}
                initialNumToRender={unacknowledgedStudents.length}
                avatarSize={24}
                style={SchoolbookWordReportCard.Style.list}
                contentContainerStyle={{ backgroundColor: theme.ui.background.card, borderRadius: UI_SIZES.radius.medium }}
                customItemStyle={{
                  marginBottom: undefined,
                  paddingVertical: UI_SIZES.spacing.small,
                  paddingHorizontal: UI_SIZES.spacing.medium,
                }}
                withSeparator
              />
            </>
          ) : null}
        </ResourceView>
      </ScrollView>
      <ModalBox
        ref={modalBoxRef}
        content={
          <>
            <HeadingSText>{I18n.t('schoolbook.schoolbookWordReportScreen.reminderModal.title')}</HeadingSText>
            <BodyText style={{ marginTop: UI_SIZES.spacing.small }}>
              {I18n.t('schoolbook.schoolbookWordReportScreen.reminderModal.text')}
            </BodyText>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginTop: UI_SIZES.spacing.large,
              }}>
              <TouchableOpacity onPress={() => modalBoxRef?.current?.doDismissModal()}>
                <SmallBoldText style={{ marginRight: UI_SIZES.spacing.big, color: theme.palette.grey.graphite }}>
                  {I18n.t('common.cancel')}
                </SmallBoldText>
              </TouchableOpacity>
              <ActionButton text={I18n.t('common.send')} iconName="pictos-send" action={action} />
            </View>
          </>
        }
      />
    </>
  );
};

SchoolbookWordReportCard.Style = StyleSheet.create({
  list: {
    marginTop: UI_SIZES.spacing.small,
    shadowColor: theme.ui.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'visible',
    backgroundColor: theme.ui.background.page,
    borderRadius: UI_SIZES.radius.medium,
  },
});

export default React.forwardRef(SchoolbookWordReportCard);
