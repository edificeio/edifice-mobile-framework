import { Moment } from 'moment';
import * as React from 'react';
import { View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { ContentCardHeader, ContentCardTitle, TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { ImageLabel, ImageType } from '~/framework/components/imageLabel';
import { Picture } from '~/framework/components/picture';
import { CaptionBoldText, CaptionItalicText, CaptionText, SmallBoldText, SmallText } from '~/framework/components/text';
import { UserType } from '~/framework/modules/auth/service';
import {
  IAcknowledgment,
  IResponse,
  getIsWordAcknowledgedForParent,
  getIsWordAcknowledgedForStudent,
  getIsWordAcknowledgedForTeacher,
} from '~/framework/modules/schoolbook/reducer';
import { displayPastDate } from '~/framework/util/date';
import { ArticleContainer } from '~/ui/ContainerContent';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

const acknowledgementsString = (ackNumber: number, total: number) =>
  `${ackNumber}/${total} ${I18n.get(`schoolbook-wordsummary-acknowledgement${ackNumber === 1 ? '' : 's'}`).toLowerCase()}`;
const acknowledgedString = (isWordAcknowledged: boolean) =>
  I18n.get(`schoolbook-wordsummary-${isWordAcknowledged ? 'acknowledged' : 'acknowledge'}`);
const responsesString = (responses: number) =>
  responses === 1
    ? `1 ${I18n.get('schoolbook-wordsummary-response').toLowerCase()}`
    : `${responses} ${I18n.get('schoolbook-wordsummary-responses').toLowerCase()}`;

export interface ISchoolbookWordSummaryCardProps {
  action: () => void;
  userType: UserType | undefined;
  userId: string | undefined;
  acknowledgments: IAcknowledgment[];
  owner: string;
  ownerName: string;
  responses: IResponse[] | null;
  ackNumber: number;
  category: string;
  respNumber: number;
  sendingDate: Moment;
  title: string;
  total: number;
}

export const SchoolbookWordSummaryCard = ({
  action,
  userType,
  userId,
  acknowledgments,
  owner,
  ownerName,
  responses,
  ackNumber,
  category,
  respNumber,
  sendingDate,
  title,
  total,
}: ISchoolbookWordSummaryCardProps) => {
  const usersTextMaxLines = 1;
  const isParent = userType === UserType.Relative;
  const isTeacher = userType === UserType.Teacher;
  const isStudent = userType === UserType.Student;
  const isWordAcknowledgedForParent = userId && getIsWordAcknowledgedForParent(userId, acknowledgments);
  const isWordAcknowledgedForTeacher = getIsWordAcknowledgedForTeacher(ackNumber, total);
  const isWordAcknowledgedForStudent = getIsWordAcknowledgedForStudent(acknowledgments);
  const isWordAcknowledged =
    (isTeacher && isWordAcknowledgedForTeacher) ||
    (isStudent && isWordAcknowledgedForStudent) ||
    (isParent && isWordAcknowledgedForParent);
  const responsesNumber = isTeacher ? respNumber : responses?.length;

  //FIXME: create/move to styles.ts
  const styles = {
    headerStyle: {
      paddingVertical: isTeacher ? 0 : UI_SIZES.spacing.minor,
      borderTopLeftRadius: UI_SIZES.radius.medium,
      borderTopRightRadius: UI_SIZES.radius.medium,
      backgroundColor: theme.palette.grey.fog,
    },
    responsesContainer: { flexDirection: 'row', alignItems: 'center' },
    topContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: UI_SIZES.spacing.minor },
  };

  return (
    <ArticleContainer>
      <TouchableResourceCard
        onPress={action}
        customHeaderStyle={styles.headerStyle}
        headerIndicator={<View />}
        header={
          isTeacher ? undefined : (
            <ContentCardHeader
              icon={<SingleAvatar status={undefined} size={36} userId={owner} />}
              text={
                <CaptionText numberOfLines={usersTextMaxLines}>
                  {`${I18n.get('common.from')} `}
                  <CaptionBoldText>{ownerName}</CaptionBoldText>
                </CaptionText>
              }
            />
          )
        }
        footer={
          responsesNumber ? (
            <View style={styles.responsesContainer}>
              <Picture
                cached
                type="NamedSvg"
                name="pictos-answer"
                width={UI_SIZES.dimensions.width.large}
                height={UI_SIZES.dimensions.height.large}
                fill={theme.ui.text.regular}
                style={{ marginRight: UI_SIZES.spacing.minor }}
              />
              <SmallText>{responsesString(responsesNumber)}</SmallText>
            </View>
          ) : undefined
        }>
        <View style={styles.topContainer}>
          {category ? (
            <ImageLabel
              cachedSVG
              imageType={ImageType.svg}
              text={I18n.get(`schoolbook-wordsummary-categories-${category}`)}
              imageName={`schoolbook-${category}`}
              color={theme.color.schoolbook.categories[category]}
            />
          ) : (
            <View />
          )}
          <SmallBoldText
            style={{ color: isTeacher || isWordAcknowledged ? theme.ui.text.regular : theme.palette.status.warning.regular }}>
            {isTeacher ? acknowledgementsString(ackNumber, total) : acknowledgedString(isWordAcknowledged)}
          </SmallBoldText>
        </View>
        {sendingDate ? (
          <CaptionItalicText style={{ color: theme.palette.grey.graphite, marginTop: UI_SIZES.spacing.minor }}>
            {displayPastDate(sendingDate)}
          </CaptionItalicText>
        ) : null}
        {title ? (
          <ContentCardTitle style={{ marginVertical: UI_SIZES.spacing.tiny, color: theme.ui.text.regular }}>
            {title}
          </ContentCardTitle>
        ) : null}
      </TouchableResourceCard>
    </ArticleContainer>
  );
};
