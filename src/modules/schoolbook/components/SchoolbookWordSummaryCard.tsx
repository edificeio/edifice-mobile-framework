import I18n from 'i18n-js';
import { Moment } from 'moment';
import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { ContentCardHeader, ContentCardTitle, TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { ImageLabel, ImageType } from '~/framework/components/imageLabel';
import { Picture } from '~/framework/components/picture';
import { Text, TextColorStyle, TextItalic, TextSemiBold, TextSizeStyle } from '~/framework/components/text';
import { displayPastDate } from '~/framework/util/date';
import { UserType } from '~/framework/util/session';
import { ArticleContainer } from '~/ui/ContainerContent';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import {
  IAcknowledgment,
  IResponse,
  getIsWordAcknowledgedForParent,
  getIsWordAcknowledgedForStudent,
  getIsWordAcknowledgedForTeacher,
  getResponseNumberForStudentAndParent,
} from '../reducer';

const acknowledgementsString = (ackNumber: number, total: number) =>
  `${ackNumber}/${total} ${I18n.t(`schoolbook.acknowledgement${total === 1 ? '' : 's'}`).toLowerCase()}`;
const acknowledgedString = (isWordAcknowledged: boolean) =>
  I18n.t(`schoolbook.${isWordAcknowledged ? 'acknowledged' : 'acknowledge'}`);
const responsesString = (responses: number) =>
  responses === 1
    ? `1 ${I18n.t('schoolbook.response').toLowerCase()}`
    : `${responses} ${I18n.t('schoolbook.responses').toLowerCase()}`;

export interface ISchoolbookWordSummaryCardProps {
  action: () => void;
  userType: UserType;
  userId: string;
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
  const isWordAcknowledgedForParent = getIsWordAcknowledgedForParent(userId, acknowledgments);
  const isWordAcknowledgedForTeacher = getIsWordAcknowledgedForTeacher(ackNumber, total);
  const isWordAcknowledgedForStudent = getIsWordAcknowledgedForStudent(acknowledgments);
  const isWordAcknowledged =
    (isTeacher && isWordAcknowledgedForTeacher) ||
    (isStudent && isWordAcknowledgedForStudent) ||
    (isParent && isWordAcknowledgedForParent);
  const responsesNumber = isTeacher ? respNumber : getResponseNumberForStudentAndParent(responses);

  return (
    <ArticleContainer>
      <TouchableResourceCard
        onPress={action}
        emphasizedHeader
        customHeaderStyle={{
          paddingVertical: isTeacher ? 0 : UI_SIZES.spacing.smallPlus,
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
        }}
        headerIndicator={<View />}
        header={
          isTeacher ? undefined : (
            <ContentCardHeader
              icon={<SingleAvatar size={36} userId={owner} />}
              text={
                <Text style={{ ...TextSizeStyle.Small }} numberOfLines={usersTextMaxLines}>
                  {`${I18n.t('common.from')} `}
                  <TextSemiBold style={{ ...TextSizeStyle.Small }}>{ownerName}</TextSemiBold>
                </Text>
              }
            />
          )
        }
        footer={
          responsesNumber ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Picture
                cached
                type="NamedSvg"
                name="pictos-answer"
                width={UI_SIZES.dimensions.width.large}
                height={UI_SIZES.dimensions.height.large}
                fill={theme.color.secondary.regular}
                style={{ marginRight: UI_SIZES.spacing.smallPlus }}
              />
              <TextSemiBold style={{ color: theme.color.secondary.regular }}>{responsesString(responsesNumber)}</TextSemiBold>
            </View>
          ) : undefined
        }>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: UI_SIZES.spacing.smallPlus }}>
          {category ? (
            <ImageLabel
              cachedSVG
              imageType={ImageType.svg}
              text={I18n.t(`schoolbook.categories.${category}`)}
              imageName={`schoolbook-${category}`}
              color={theme.schoolbook.categories[category]}
            />
          ) : (
            <View />
          )}
          <TextSemiBold style={{ color: isTeacher || isWordAcknowledged ? undefined : theme.color.warning }}>
            {isTeacher ? acknowledgementsString(ackNumber, total) : acknowledgedString(isWordAcknowledged)}
          </TextSemiBold>
        </View>
        {sendingDate ? (
          <TextItalic style={{ color: theme.greyPalette.graphite, ...TextSizeStyle.Small, marginTop: UI_SIZES.spacing.smallPlus }}>
            {displayPastDate(sendingDate)}
          </TextItalic>
        ) : null}
        {title ? (
          <ContentCardTitle style={{ marginVertical: UI_SIZES.spacing.extraSmall, ...TextColorStyle.Normal }}>
            {title}
          </ContentCardTitle>
        ) : null}
      </TouchableResourceCard>
    </ArticleContainer>
  );
};
