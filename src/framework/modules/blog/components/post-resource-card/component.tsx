import * as React from 'react';
import { Animated, View } from 'react-native';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import DefaultButton from '~/framework/components/buttons/default';
import { ContentCardHeader, ContentCardIcon, ContentCardTitle, TouchableResourceCard } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { NamedSVG } from '~/framework/components/picture';
import { SmallBoldText, SmallText } from '~/framework/components/text';
import { extractMediaFromHtml, extractTextFromHtml, renderMediaPreview } from '~/framework/util/htmlParser/content';
import { isStringEmpty } from '~/framework/util/string';
import { ArticleContainer } from '~/ui/ContainerContent';

import styles from './styles';
import { BlogPostResourceCardProps } from './types';

export const BlogPostResourceCard = React.memo(
  ({ action, authorId, authorName, comments, contentHtml, date, title, state, resourceId }: BlogPostResourceCardProps) => {
    const authorTextMaxLines = 1;
    const contentTextMaxLines = 5;
    const blogPostText = extractTextFromHtml(contentHtml);
    const blogPostMedia = extractMediaFromHtml(contentHtml);
    const hasBlogPostText = blogPostText && !isStringEmpty(blogPostText);
    const hasBlogPostMedia = blogPostMedia?.length;

    const reactionsOpacity = React.useRef(new Animated.Value(0)).current;
    const reactionsYPos = React.useRef(new Animated.Value(0)).current;

    const animateReactions = React.useCallback(
      ({ opacity, ypos }: { opacity: number; ypos: number }) => {
        Animated.parallel([
          Animated.timing(reactionsOpacity, {
            toValue: opacity,
            duration: 100,
            useNativeDriver: false,
          }),
          Animated.timing(reactionsYPos, {
            toValue: ypos,
            duration: 100,
            useNativeDriver: false,
          }),
        ]).start();
      },
      [reactionsOpacity, reactionsYPos],
    );

    return (
      <ArticleContainer>
        <TouchableResourceCard
          onPress={action}
          header={
            <ContentCardHeader
              icon={<ContentCardIcon userIds={[authorId || require('ASSETS/images/system-avatar.png')]} />}
              text={
                authorName ? (
                  <SmallBoldText numberOfLines={authorTextMaxLines}>{`${I18n.get('common-by')} ${authorName}`}</SmallBoldText>
                ) : undefined
              }
              date={date}
            />
          }
          title={
            <>
              {state === 'SUBMITTED' ? (
                <SmallBoldText style={{ color: theme.palette.status.warning.regular }}>
                  {I18n.get('blog-postlist-needvalidation')}
                </SmallBoldText>
              ) : null}
              <ContentCardTitle>{title}</ContentCardTitle>
            </>
          }
          footer={
            state !== 'SUBMITTED' ? (
              <View>
                <Animated.View
                  style={[styles.footerReactions, { transform: [{ translateY: reactionsYPos }], opacity: reactionsOpacity }]}>
                  <NamedSVG name="reaction-thankyou" />
                  <NamedSVG name="reaction-welldone" />
                  <NamedSVG name="reaction-awesome" />
                  <NamedSVG name="reaction-instructive" />
                </Animated.View>
                <DefaultButton
                  text="Réagir"
                  iconLeft="ui-reaction"
                  contentColor={theme.palette.grey.black}
                  style={styles.footerButton}
                  onLongPress={() => animateReactions({ opacity: 1, ypos: -UI_SIZES.spacing.minor })}
                  // onPressOut={() => animateReactions({ opacity: 0, ypos: 0 })}
                  pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
                  onBlur={() => {
                    console.log('onBlur');
                  }}
                />
              </View>
            ) : undefined
          }>
          {hasBlogPostText ? (
            <SmallText
              style={{ marginBottom: blogPostMedia?.length ? UI_SIZES.spacing.small : undefined }}
              numberOfLines={contentTextMaxLines}>
              {blogPostText}
            </SmallText>
          ) : null}
          {hasBlogPostMedia ? renderMediaPreview(blogPostMedia, { module: 'blog', resourceType: 'post', resourceId }) : null}
        </TouchableResourceCard>
      </ArticleContainer>
    );
  },
);
