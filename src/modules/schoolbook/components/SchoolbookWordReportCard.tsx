import I18n from 'i18n-js';
import * as React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import ModalBox from '~/framework/components/ModalBox';
import UserList from '~/framework/components/UserList';
import { ResourceView } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import ScrollView from '~/framework/components/scrollView';
import { FontStyle, Text, TextBold, TextSemiBold, TextSizeStyle } from '~/framework/components/text';
import { TextAvatar } from '~/framework/components/textAvatar';
import { IUserSession } from '~/framework/util/session';

import { IAcknowledgment, IWordReport, getStudentsByAcknowledgementForTeacher } from '../reducer';
import { hasResendRight } from '../rights';

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
              <TextBold
                style={{
                  ...TextSizeStyle.SlightBigPlus,
                  marginTop: UI_SIZES.spacing.tiny,
                }}>
                {acknowledgementsString(word?.ackNumber, word?.total)}
              </TextBold>
              <Text style={{ marginTop: UI_SIZES.spacing.minor }}>
                {I18n.t('schoolbook.schoolbookWordReportScreen.relativesDidAcknowledge')}
              </Text>
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
                      <TextAvatar isHorizontal size={24} userId={item.owner} text={item.ownerName} />
                      <View style={{ marginLeft: UI_SIZES.spacing.large }}>
                        <Text
                          numberOfLines={acknowledgedByTextMaxLines}
                          style={{ color: theme.palette.grey.graphite, ...TextSizeStyle.Small }}>
                          {acknowledgedByString(item.acknowledgments)}
                        </Text>
                        {item.responses?.map(response => (
                          <View
                            style={{
                              backgroundColor: theme.palette.grey.fog,
                              borderRadius: UI_SIZES.radius.medium,
                              borderWidth: 1,
                              borderColor: theme.palette.grey.cloudy,
                              padding: UI_SIZES.spacing.minor,
                              marginTop: UI_SIZES.spacing.tiny,
                            }}>
                            <TextAvatar
                              isHorizontal
                              size={24}
                              userId={response.owner}
                              text={response.parentName}
                              textStyle={{ ...FontStyle.SemiBold, ...TextSizeStyle.Small }}
                            />
                            <Text style={{ ...TextSizeStyle.Small, marginLeft: UI_SIZES.spacing.large }}>{response.comment}</Text>
                          </View>
                        ))}
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
                <TextBold style={{ ...TextSizeStyle.SlightBigPlus }}>
                  {unacknowledgementsString(word?.ackNumber, word?.total)}
                </TextBold>
                {hasSchoolbookWordResendRights ? (
                  <ActionButton
                    type="secondary"
                    text={I18n.t('schoolbook.schoolbookWordReportScreen.reminder')}
                    iconName="pictos-send"
                    leftIcon
                    action={() => modalBoxRef?.current?.doShowModal()}
                  />
                ) : null}
              </View>
              <Text style={{ marginTop: UI_SIZES.spacing.minor }}>
                {`${I18n.t('schoolbook.schoolbookWordReportScreen.relativesDidNotAcknowledge')}${
                  hasSchoolbookWordResendRights ? ' ' + I18n.t('schoolbook.schoolbookWordReportScreen.reminderPossible') : ''
                }`}
              </Text>
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
            <TextBold style={{ ...TextSizeStyle.SlightBigPlus }}>
              {I18n.t('schoolbook.schoolbookWordReportScreen.reminderModal.title')}
            </TextBold>
            <Text style={{ ...TextSizeStyle.SlightBig, marginTop: UI_SIZES.spacing.small }}>
              {I18n.t('schoolbook.schoolbookWordReportScreen.reminderModal.text')}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                marginTop: UI_SIZES.spacing.large,
              }}>
              <TouchableOpacity onPress={() => modalBoxRef?.current?.doDismissModal()}>
                <TextSemiBold style={{ marginRight: UI_SIZES.spacing.big, color: theme.palette.grey.graphite }}>
                  {I18n.t('common.cancel')}
                </TextSemiBold>
              </TouchableOpacity>
              <ActionButton text={I18n.t('common.send')} iconName="pictos-send" leftIcon action={action} />
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
