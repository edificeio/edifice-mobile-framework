import styled from '@emotion/native';
import { Moment } from 'moment';
import * as React from 'react';
import {
  ColorValue,
  Image,
  ImageSourcePropType,
  ImageStyle,
  StyleSheet,
  TextProps,
  TextStyle,
  TouchableOpacityProps,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';

import theme from '~/app/theme';
import { displayPastDate } from '~/framework/util/date';
import { HtmlContentView } from '~/ui/HtmlContentView';
import { GridAvatars } from '~/ui/avatars/GridAvatars';

import { Badge } from './badge';
import { UI_SIZES } from './constants';
import { Icon, NamedSVG, Picture, PictureProps } from './picture';
import { FontStyle, Text, TextColorStyle, TextItalic, TextSizeStyle, remlh } from './text';

export const cardPaddingV = 12;
export const cardPaddingH = 16;
export const cardPadding: ViewStyle = { paddingHorizontal: cardPaddingH, paddingVertical: cardPaddingV };
export const cardPaddingEqual: ViewStyle = { paddingHorizontal: 0, paddingVertical: cardPaddingH - cardPaddingV };
export const cardPaddingMerging: ViewStyle = { paddingHorizontal: cardPaddingH, paddingBottom: cardPaddingV };
export const cardPaddingSmall: ViewStyle = { paddingHorizontal: cardPaddingH, paddingVertical: (cardPaddingV * 2) / 3 };

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
export const CardPaddingEqual = styled.View(cardStyle, cardPaddingEqual);
export const TouchCard = styled.TouchableOpacity(cardStyle, cardPadding, cardShadow);
export const TouchCardWithoutPadding = styled.TouchableOpacity(cardStyle, cardShadow);
export const TouchCardPaddingEqual = styled.TouchableOpacity(cardStyle, cardPaddingEqual);
export const InfoCard = styled.View(cardStyle, cardPadding, { backgroundColor: theme.color.secondary.light });

export interface IContentCardProps extends ViewProps {
  header?: React.ReactElement;
  footer?: React.ReactElement;
}
export interface ITouchableContentCardProps extends IContentCardProps, TouchableOpacityProps {
  headerIndicator?: React.ReactElement;
  customHeaderIndicatorStyle?: ViewStyle;
}
interface IContentCardPropsBase extends IContentCardProps, ITouchableContentCardProps {
  cardComponent?: React.ComponentType;
  withoutPadding?: boolean;
  customHeaderStyle?: ViewStyle;
  emphasizedHeader?: boolean;
  customHeaderIndicatorStyle?: ViewStyle;
}

const FooterSeparator = styled.View({
  height: 1,
  width: '100%',
  backgroundColor: theme.color.inputBorder,
});
const HeaderFlexView = styled.View({
  flexDirection: 'row',
  // ...cardPadding,
});
const ContentFlexView = styled.View({
  // ...cardPaddingMerging,
});
const FooterFlexView = styled.View({
  // ...cardPaddingSmall,
});
const ContentCardBase = (props: IContentCardPropsBase) => {
  const CC = props.cardComponent ?? CardWithoutPadding;
  const {
    header,
    footer,
    children,
    headerIndicator,
    cardComponent,
    withoutPadding,
    customHeaderStyle,
    emphasizedHeader,
    customHeaderIndicatorStyle,
    ...viewProps
  } = props;
  const HeaderFlexViewWithPadding = styled(HeaderFlexView)(
    cardPadding,
    withoutPadding && { paddingHorizontal: 0 },
    customHeaderStyle,
    emphasizedHeader && {
      backgroundColor: theme.greyPalette.fog,
      borderBottomColor: theme.greyPalette.pearl,
      borderBottomWidth: UI_SIZES.dimensions.width.tiny,
    },
  );
  const ContentFlexViewWithPadding = styled(ContentFlexView)(cardPaddingMerging, withoutPadding && { paddingHorizontal: 0 });
  const FooterFlexViewWithPadding = styled(FooterFlexView)(cardPaddingSmall, withoutPadding && { paddingHorizontal: 0 });
  return (
    <CC {...viewProps}>
      <HeaderFlexViewWithPadding>
        <View style={{ flex: 1 }}>{props.header ?? null}</View>
        <View style={[{ flex: 0 }, props.customHeaderIndicatorStyle]}>{props.headerIndicator ?? null}</View>
      </HeaderFlexViewWithPadding>
      {props.children ? <ContentFlexViewWithPadding>{props.children}</ContentFlexViewWithPadding> : null}
      {props.footer ? (
        <>
          <FooterSeparator />
          <FooterFlexViewWithPadding>{props.footer}</FooterFlexViewWithPadding>
        </>
      ) : null}
    </CC>
  );
};

/** Card for displaying some fancy content */
export const ContentCard = (props: IContentCardProps) => {
  return <ContentCardBase {...props} />;
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
  return <ContentCardBase {...otherProps} headerIndicator={realHeaderIndicator} cardComponent={TouchCardWithoutPadding} />;
};
export const ContentView = (props: IContentCardProps) => {
  return <ContentCardBase {...props} cardComponent={View} />;
};

/** Pre-configured title for ContentCard */
export const ContentCardTitle = (props: TextProps) => {
  const { style, ...otherProps } = props;
  const Comp = styled(Text)({ ...TextColorStyle.Action, ...TextSizeStyle.SlightBig });
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
          <View style={{ flex: 0, width: 8 }} />
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
          <TextItalic style={{ color: theme.greyPalette.graphite, ...TextSizeStyle.Small }}>
            {typeof props.date === 'string' ? props.date : displayPastDate(props.date)}
          </TextItalic>
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

export interface IResourceCardProps extends ViewProps, Omit<Partial<IContentCardProps>, 'header'> {
  icon?: IContentCardIconProps;
  header?: string | React.ReactElement;
  headerHtml?: string;
  date?: IContentCardHeaderProps['date'];
  title?: string | React.ReactElement;
  footer?: IContentCardProps['footer'];
  children?: React.ReactNode;
}
export interface IResourceCardProps_base extends IResourceCardProps {
  CC: React.ComponentType<IContentCardProps>;
  withoutPadding?: boolean;
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
          <View style={{ height: 12 }} />
        </>
      ) : null}
      {children}
    </CC>
  );
};
export const ResourceCard = (props: IResourceCardProps) => {
  return <ResourceCard_base {...props} CC={ContentCard} />;
};
export const TouchableResourceCard = (
  props: IResourceCardProps & TouchableOpacityProps & Omit<ITouchableContentCardProps, 'header'>,
) => {
  return <ResourceCard_base {...props} CC={TouchableContentCard} />;
};

export const ResourceView = (props: IResourceCardProps) => {
  return <ResourceCard_base {...props} CC={ContentView} />;
};

export type PictureCardProps = {
  text?: string | React.ReactElement;
  textStyle?: TextStyle;
  picture: PictureProps;
  pictureStyle?: ViewStyle;
} & ViewProps;

function PictureCard_Base(props: PictureCardProps & { cardComponent?: React.ComponentType<ViewProps> }) {
  const { cardComponent, text, textStyle, picture, style, ...viewProps } = props;
  const CC = cardComponent ?? CardWithoutPadding;
  return (
    <CC {...viewProps} style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <Picture {...picture} />
      {text ? (
        typeof text === 'string' ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: UI_SIZES.spacing.smallPlus, height: remlh(2) }}>
            <Text
              numberOfLines={2}
              style={[
                {
                  textAlign: 'center',
                  ...FontStyle.SemiBold,
                },
                textStyle,
              ]}>
              {text}
            </Text>
          </View>
        ) : (
          text
        )
      ) : null}
    </CC>
  );
}
export function PictureCard(props: PictureCardProps) {
  return <PictureCard_Base cardComponent={Card} {...props} />;
}
export function TouchablePictureCard(props: PictureCardProps & TouchableOpacityProps) {
  return <PictureCard_Base cardComponent={TouchCard} {...props} />;
}

function SelectorPictureCard_Base(props: PictureCardProps & { cardComponent?: React.ComponentType<ViewProps> }) {
  const { style, picture, pictureStyle, ...rest } = props;
  picture['style'] = { maxWidth: '100%', ...pictureStyle };
  picture['resizeMode'] = 'contain';
  return (
    <PictureCard
      style={[{ paddingVertical: UI_SIZES.spacing.large, paddingHorizontal: UI_SIZES.spacing.large }, style]}
      picture={picture}
      {...rest}
    />
  );
}
export function SelectorPictureCard(props: PictureCardProps) {
  return <SelectorPictureCard_Base cardComponent={Card} {...props} />;
}
export function TouchableSelectorPictureCard(props: PictureCardProps & TouchableOpacityProps) {
  return <SelectorPictureCard_Base cardComponent={TouchCard} {...props} />;
}

export type OverviewCardProps = {
  title?: string | React.ReactElement;
  picture?: PictureProps;
  pictureStyle?: PictureProps['style'];
  pictureWrapperStyle?: ViewStyle;
} & ViewProps;

function OverviewCardBase(props: OverviewCardProps & { cardComponent?: React.ComponentType<IContentCardProps> }) {
  const { cardComponent, children, title, style, picture, pictureStyle, pictureWrapperStyle, ...rest } = props;
  if (picture) {
    if (picture.type === 'Image') picture.resizeMode = 'contain';
    if (picture.type === 'NamedSvg') picture.fill = theme.color.text.inverse;
  }
  const CC = cardComponent ?? ContentCard;
  return (
    <CC
      {...rest}
      style={[OverviewCardBase.styles.card, style]}
      header={
        <View style={OverviewCardBase.styles.header}>
          {picture ? (
            <View style={[OverviewCardBase.styles.pictureWrapper, pictureWrapperStyle]}>
              <Picture style={[OverviewCardBase.styles.picture, pictureStyle] as ImageStyle} {...picture} />
            </View>
          ) : null}
          {title ? (
            typeof title === 'string' ? (
              <ContentCardTitle style={FontStyle.SemiBold}>{title}</ContentCardTitle>
            ) : (
              title
            )
          ) : null}
        </View>
      }>
      {children}
    </CC>
  );
}
OverviewCardBase.styles = StyleSheet.create({
  card: {
    alignItems: 'stretch',
    ...cardPaddingEqual,
  },
  header: {
    flexDirection: 'row',
  },
  picture: {
    width: 16,
    height: 16,
  },
  pictureWrapper: {
    width: 24,
    height: 24,
    backgroundColor: theme.color.secondary.regular,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 4,
    marginRight: 8,
  },
});
export function OverviewCard(props: OverviewCardProps) {
  return <OverviewCardBase {...props} />;
}
export function TouchableOverviewCard(props: OverviewCardProps & TouchableOpacityProps) {
  return (
    <OverviewCardBase
      cardComponent={TouchableContentCard}
      headerIndicator={
        <NamedSVG
          key="chevron"
          width={UI_SIZES.dimensions.width.larger}
          height={UI_SIZES.dimensions.width.larger} // width again to ensure it's a square !
          name="ui-rafterRight"
          fill={theme.color.secondary.regular}
        />
      }
      {...props}
    />
  );
}
