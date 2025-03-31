import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import styles from './styles';
import { HomeworkCardProps } from './types';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon, Svg } from '~/framework/components/picture';
import { BodyBoldText, SmallText, TextSizeStyle } from '~/framework/components/text';
import { getDayOfTheWeek, today } from '~/framework/util/date';
import { extractMediaFromHtml } from '~/framework/util/htmlParser/content';
import { IMedia } from '~/framework/util/notifications';
import HtmlToText from '~/infra/htmlConverter/text';

const noMargin: number = 0;
const overlapMargin: number = -(UI_SIZES.spacing.tiny + UI_SIZES.spacing._LEGACY_tiny);

const HomeworkCard = ({ content, date, finished, onPress, style, title }: HomeworkCardProps) => {
  const isPastDate = date.isBefore(today(), 'day');
  const dayOfTheWeek = getDayOfTheWeek(date);
  const dayColor = theme.color.homework.days[dayOfTheWeek]?.accent ?? theme.palette.grey.stone;
  const arrowColor = isPastDate ? theme.palette.grey.stone : dayColor;
  const formattedContent = content && HtmlToText(content, false).render;

  const renderMediaIcons = React.useCallback(() => {
    /**
     * Render icons representing media types featured in the task
     */
    const mediaTypes: IMedia[] = content ? extractMediaFromHtml(content) || [] : [];
    const mediaTypesPerTask = [...new Set(mediaTypes.map(media => media.type))];

    const mediaIcons: { [key: string]: string } = {
      audio: 'ui-mic-preview',
      image: 'ui-image-preview',
      video: 'ui-record-video-preview',
    };

    if (mediaTypesPerTask.length === 0) {
      return;
    } else {
      return (
        <View style={styles.viewMediaIcons}>
          {mediaTypesPerTask.map((type, index) => (
            <Svg
              key={index}
              name={mediaIcons[type]}
              style={{
                marginLeft: index === 0 ? noMargin : overlapMargin,
                zIndex: mediaTypesPerTask.length + index,
              }}
              width={UI_SIZES.elements.icon.medium}
              height={UI_SIZES.elements.icon.medium}
            />
          ))}
        </View>
      );
    }
  }, [content]);

  return (
    <TouchableOpacity onPress={onPress} style={[styles.item, style]}>
      <View style={styles.viewTexts}>
        <View style={styles.viewTitle}>
          <View>{title ? <BodyBoldText numberOfLines={1}>{title}</BodyBoldText> : null}</View>
          {finished === undefined ? null : (
            <Svg
              fill={finished ? theme.palette.status.success.regular : theme.palette.grey.stone}
              name={`ui-${finished ? 'check' : 'clock'}`}
              style={styles.status}
              width={UI_SIZES.elements.icon.xsmall}
              height={UI_SIZES.elements.icon.xsmall}
            />
          )}
        </View>
        {formattedContent ? (
          <SmallText style={styles.taskContent} numberOfLines={2}>
            {formattedContent}
          </SmallText>
        ) : null}
        {renderMediaIcons()}
      </View>
      <View style={styles.viewArrow}>
        <Icon name="arrow_right" color={arrowColor} size={TextSizeStyle.Medium.fontSize} style={{ left: UI_SIZES.spacing.tiny }} />
      </View>
    </TouchableOpacity>
  );
};

export default HomeworkCard;
