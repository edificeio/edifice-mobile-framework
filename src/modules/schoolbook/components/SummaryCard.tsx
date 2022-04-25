import I18n from 'i18n-js';
import { Moment } from 'moment';
import * as React from 'react';
import { View } from 'react-native';

import theme from '~/app/theme';
import { ContentCardHeader, ContentCardTitle, TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/icon';
import { ImageLabel, ImageType } from '~/framework/components/imageLabel';
import Label from '~/framework/components/label';
import { Text, TextSemiBold, TextSizeStyle } from '~/framework/components/text';
import { extractMediaFromHtml, extractTextFromHtml, renderMediaPreview } from '~/framework/util/htmlParser/content';
import { UserType } from '~/framework/util/session';
import { isStringEmpty } from '~/framework/util/string';
import { ArticleContainer } from '~/ui/ContainerContent';
import { SingleAvatar } from '~/ui/avatars/SingleAvatar';

import {
  IAcknowledgment,
  IResponse,
  getHasSingleRecipientForTeacher,
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
const recipientsString = (recipients: any) =>
  getHasSingleRecipientForTeacher(recipients)
    ? recipients[0].displayName
    : `${recipients.length} ${I18n.t('schoolbook.students').toLowerCase()}`;

export interface ISummaryCardProps {
  action: () => void;
  userType: string;
  userId: string;
  acknowledgments: IAcknowledgment[];
  owner: string;
  ownerName: string;
  responses: IResponse[] | null;
  ackNumber: number;
  category: string;
  recipients: any;
  respNumber: number;
  sendingDate: Moment;
  text: string;
  title: string;
  total: number;
}

export const SummaryCard = ({
  action,
  userType,
  userId,
  acknowledgments,
  owner,
  ownerName,
  responses,
  ackNumber,
  category,
  recipients,
  respNumber,
  sendingDate,
  text,
  title,
  total,
}: ISummaryCardProps) => {
  const [isTextTruncatedWithBackspace, setIsTextTruncatedWithBackspace] = React.useState(false);
  const usersTextMaxLines = 1;
  const contentTextMaxLines = 2;
  const schoolbookWordText = extractTextFromHtml(text);
  const schoolbookWordMedia = extractMediaFromHtml(text);
  const hasSchoolbookWordText = schoolbookWordText && !isStringEmpty(schoolbookWordText);
  const hasSchoolbookWordMedia = schoolbookWordMedia?.length;
  const isTeacher = userType === UserType.Teacher;
  const isStudent = userType === UserType.Student;
  const isParent = userType === UserType.Relative;
  const isWordAcknowledgedForTeacher = getIsWordAcknowledgedForTeacher(ackNumber, total);
  const isWordAcknowledgedForStudent = getIsWordAcknowledgedForStudent(acknowledgments);
  const isWordAcknowledgedForParent = getIsWordAcknowledgedForParent(userId, acknowledgments);
  const isWordAcknowledged =
    (isTeacher && isWordAcknowledgedForTeacher) ||
    (isStudent && isWordAcknowledgedForStudent) ||
    (isParent && isWordAcknowledgedForParent);
  const hasSingleRecipient = getHasSingleRecipientForTeacher(recipients);
  const responsesNumber = isTeacher ? respNumber : getResponseNumberForStudentAndParent(responses);

  return (
    <ArticleContainer>
      <TouchableResourceCard
        onPress={action}
        emphasizedHeader
        customHeaderIndicatorStyle={{ justifyContent: 'center' }}
        headerIndicator={
          <Label
            text={isTeacher ? acknowledgementsString(ackNumber, total) : acknowledgedString(isWordAcknowledged)}
            color={isWordAcknowledged ? theme.schoolbook.acknowledged : theme.schoolbook.acknowledge}
            labelStyle="outline"
          />
        }
        header={
          <ContentCardHeader
            icon={
              <SingleAvatar
                size={24}
                userId={
                  isTeacher
                    ? hasSingleRecipient
                      ? recipients[0]?.userId || require('ASSETS/images/no-avatar.png')
                      : require('ASSETS/images/group-avatar.png')
                    : owner || require('ASSETS/images/no-avatar.png')
                }
              />
            }
            text={
              <Text style={{ ...TextSizeStyle.Small }} numberOfLines={usersTextMaxLines}>
                {`${I18n.t(`common.${isTeacher ? 'to' : 'from'}`)} `}
                <TextSemiBold style={{ ...TextSizeStyle.Small }}>
                  {isTeacher ? recipientsString(recipients) : ownerName}
                </TextSemiBold>
              </Text>
            }
            date={sendingDate}
          />
        }>
        {category ? (
          <View style={{ marginTop: UI_SIZES.spacing.medium }}>
            <ImageLabel
              text={I18n.t(`schoolbook.categories.${category}`)}
              imageName={`schoolbook-${category}`}
              imageType={ImageType.svg}
              color={theme.schoolbook.categories[category]}
            />
          </View>
        ) : null}
        {title ? <ContentCardTitle style={{ marginTop: UI_SIZES.spacing.smallPlus }}>{title}</ContentCardTitle> : null}
        {hasSchoolbookWordText ? (
          <View style={{ marginTop: UI_SIZES.spacing.extraSmall }}>
            <Text
              numberOfLines={contentTextMaxLines}
              onTextLayout={({ nativeEvent: { lines } }) => {
                const isTextTruncatedWithBackspace =
                  lines.length === contentTextMaxLines && lines[contentTextMaxLines - 1].text.endsWith('\n');
                setIsTextTruncatedWithBackspace(isTextTruncatedWithBackspace);
              }}>
              {schoolbookWordText}
            </Text>
            {isTextTruncatedWithBackspace ? <Text>...</Text> : null}
          </View>
        ) : null}
        {hasSchoolbookWordMedia ? (
          <View style={{ marginTop: UI_SIZES.spacing.extraSmall }}>{renderMediaPreview(schoolbookWordMedia)}</View>
        ) : null}
        {responsesNumber ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: UI_SIZES.spacing.medium,
            }}>
            <Icon
              style={{ marginRight: UI_SIZES.spacing.smallPlus }}
              size={18}
              name="chat3"
              color={theme.color.secondary.regular}
            />
            <TextSemiBold style={{ color: theme.color.secondary.regular, ...TextSizeStyle.Small }}>
              {responsesString(responsesNumber)}
            </TextSemiBold>
          </View>
        ) : null}
      </TouchableResourceCard>
    </ArticleContainer>
  );
};
