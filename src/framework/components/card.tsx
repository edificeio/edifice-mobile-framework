import styled from '@emotion/native';
import { ColorValue, Image, ImageSourcePropType, TextProps, TouchableOpacityProps, View, ViewProps, ViewStyle } from 'react-native';
import * as React from 'react';

import theme from '~/app/theme';
import { FontStyle, Text, TextBold, TextColorStyle, TextLight, TextSemiBold, TextSizeStyle } from './text';
import { Icon } from './icon';
import { Moment } from 'moment';
import { displayPastDate } from '../util/date';
import { GridAvatars } from '~/ui/avatars/GridAvatars';
import { HtmlContentView } from '~/ui/HtmlContentView';

const cardPaddingV = 12;
const cardPaddingH = 16;
const cardPadding: ViewStyle = { paddingHorizontal: cardPaddingH, paddingVertical: cardPaddingV };
const cardPaddingMerging: ViewStyle = { paddingHorizontal: cardPaddingH, paddingBottom: cardPaddingV };
const cardPaddingSmall: ViewStyle = { paddingHorizontal: cardPaddingH, paddingVertical: (cardPaddingV * 2) / 3 };

const cardStyle: ViewStyle = {
  backgroundColor: theme.color.background.card,
  borderRadius: 15,
};

const cardShadow: ViewStyle = {
  shadowColor: theme.color.shadowColor,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 1,
  elevation: 1,
};

export const Card = styled.View(cardStyle, cardPadding, cardShadow);
export const CardWithoutPadding = styled.View(cardStyle, cardShadow);
export const TouchCard = styled.TouchableOpacity(cardStyle, cardPadding, cardShadow);
export const TouchCardWithoutPadding = styled.TouchableOpacity(cardStyle, cardShadow);
export const InfoCard = styled.View(cardStyle, cardPadding, { backgroundColor: theme.color.secondary.light });

export interface IContentCardProps extends ViewProps {
  header?: React.ReactElement;
  footer?: React.ReactElement;
}
export interface ITouchableContentCardProps extends IContentCardProps, TouchableOpacityProps {
  headerIndicator?: React.ReactElement;
}
interface IContentCardProps_Base extends IContentCardProps, ITouchableContentCardProps {
  cardComponent?: React.ComponentType;
}

const FooterSeparator = styled.View({
  height: 1,
  width: '100%',
  backgroundColor: theme.color.inputBorder,
});
const HeaderFlexView = styled.View({
  flexDirection: 'row',
  ...cardPadding,
});
const ContentFlexView = styled.View({
  ...cardPaddingMerging,
});
const FooterFlexView = styled.View({
  ...cardPaddingSmall,
});
const ContentCard_base = (props: IContentCardProps_Base) => {
  const CC = props.cardComponent ?? CardWithoutPadding;
  const { header, footer, children, headerIndicator, cardComponent, ...viewProps } = props;
  return (
    <CC {...viewProps}>
      <HeaderFlexView>
        <View style={{ flex: 1 }}>{props.header ?? null}</View>
        <View style={{ flex: 0 }}>{props.headerIndicator ?? null}</View>
      </HeaderFlexView>
      <ContentFlexView>{props.children}</ContentFlexView>
      {props.footer ? (
        <>
          <FooterSeparator />
          <FooterFlexView>{props.footer}</FooterFlexView>
        </>
      ) : null}
    </CC>
  );
};

/** Card for displaying some fancy content */
export const ContentCard = (props: IContentCardProps) => {
  return <ContentCard_base {...props} />;
};
export const TouchableContentCard = (props: ITouchableContentCardProps) => {
  const { headerIndicator, ...otherProps } = props;
  const realHeaderIndicator = headerIndicator ?? (
    <Icon
      name="arrow_right"
      color={theme.color.secondary.regular}
      style={{ paddingVertical: 6, paddingLeft: 8, marginRight: -3 }}
    />
  );
  return <ContentCard_base {...otherProps} headerIndicator={realHeaderIndicator} cardComponent={TouchCardWithoutPadding} />;
};

/** Pre-configured title for ContentCard */
export const ContentCardTitle = (props: TextProps) => {
  const { style, ...otherProps } = props;
  const Comp = styled(TextBold)({ ...TextColorStyle.Action });
  return <Comp numberOfLines={2} ellipsizeMode="tail" {...otherProps} style={style} />;
};

export interface IContentCardHeaderProps {
  icon?: React.ReactElement;
  text?: string | React.ReactElement;
  date?: string | Moment;
}
export interface IContentCardIconProps {
  userIds?: string | ImageSourcePropType | (string | ImageSourcePropType)[];
  source?: ImageSourcePropType;
  badge?: { icon: string; color: ColorValue; style?: ViewStyle };
}
/** A Header layout for ContentCard */
export const ContentCardHeader = (props: IContentCardHeaderProps) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {props.icon ? (
        <>
          <View style={{ flex: 0 }}>{props.icon}</View>
          <View style={{ flex: 0, width: 12 }} />
        </>
      ) : null}
      <View style={{ flex: 1 }}>
        {props.text ? (
          typeof props.text === 'string' ? (
            <Text style={{ ...TextSizeStyle.Small }}>{props.text}</Text>
          ) : (
            props.text
          )
        ) : null}
        {props.date ? (
          <Text style={{ color: theme.color.text.light, fontSize: 12 }}>
            {typeof props.date === 'string' ? props.date : displayPastDate(props.date)}
          </Text>
        ) : null}
      </View>
    </View>
  );
};
/** Icon builder for ContentCard and other things */
export const ContentCardIcon = (props: IContentCardIconProps) => {
  const ids = props.userIds ? (Array.isArray(props.userIds) ? props.userIds : [props.userIds]) : undefined;
  const img = ids ? <GridAvatars users={ids} /> : props.source ? <Image source={props.source} /> : null;
  return (
    <View>
      {img}
      {props.badge ? (
        <View style={[{ position: 'absolute', bottom: 0, right: 0 }, props.badge.style]}>
          <Badge content={props.badge.icon} color={props.badge.color} />
        </View>
      ) : null}
    </View>
  );
};

export interface IBadgeProps {
  content: number | string;
  color?: string | ColorValue;
}
const ViewBadge = styled.View(
  {
    alignItems: 'center',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    height: 18,
    width: 18,
    borderRadius: 10,
  },
  (props: Pick<IBadgeProps, 'color'>) => ({
    backgroundColor: props.color || theme.color.neutral.regular,
  }),
);
const BadgeText = styled(TextSemiBold)({
  color: theme.color.text.inverse,
});
/** Badge builder */
export const Badge = ({ content, color }: IBadgeProps) => {
  if (!content) {
    return null;
  }

  return (
    <ViewBadge color={color}>
      {typeof content === 'number' ? (
        <BadgeText>{content > 99 ? '99+' : content}</BadgeText>
      ) : typeof content === 'string' ? (
        <Icon size={10} color="#ffffff" name={content} />
      ) : null}
    </ViewBadge>
  );
};

export interface IResourceCardProps {
  icon?: IContentCardIconProps;
  header?: string | React.ReactElement;
  headerHtml?: string;
  date?: IContentCardHeaderProps['date'];
  title?: string | React.ReactElement;
  footer?: IContentCardProps['footer'];
  children?: React.ReactNode;
}
export interface IResourceCardProps_base extends IResourceCardProps {
  CC: typeof ContentCard | typeof TouchableContentCard;
}
const ResourceCard_base = (props: IResourceCardProps_base) => {
  const { CC, children, icon, date, header, title, headerHtml, footer, ...otherProps } = props;
  const metaDataComponent =
    typeof header === 'string' ? (
      <ContentCardHeader
        icon={<ContentCardIcon {...icon} />}
        date={date}
        text={
          header ??
          (headerHtml ? (
            <HtmlContentView
              html={headerHtml}
              opts={{
                hyperlinks: false,
                textFormatting: false,
                textColor: false,
                audio: false,
                video: false,
                iframes: false,
                images: false,
                ignoreLineBreaks: true,
                globalTextStyle: {
                  color: theme.color.text.regular,
                  fontSize: 12,
                  fontWeight: '400',
                },
                linkTextStyle: {
                  ...FontStyle.SemiBold,
                  color: theme.color.text.heavy,
                },
              }}
            />
          ) : undefined)
        }
      />
    ) : (
      header
    );
  const realHeader = title ? typeof title === 'string' ? <ContentCardTitle>{title}</ContentCardTitle> : title : metaDataComponent;
  return (
    <CC header={realHeader} footer={footer} {...otherProps}>
      {title ? (
        <>
          {metaDataComponent}
          <View style={{ height: 12 }}></View>
        </>
      ) : null}
      {children}
    </CC>
  );
};
export const ResourceCard = (props: IResourceCardProps) => {
  return <ResourceCard_base {...props} CC={ContentCard} />;
};
export const TouchableResourceCard = (props: IResourceCardProps & TouchableOpacityProps) => {
  return <ResourceCard_base {...props} CC={TouchableContentCard} />;
};
