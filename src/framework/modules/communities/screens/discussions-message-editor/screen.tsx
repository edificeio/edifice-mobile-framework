import * as React from 'react';
import { Keyboard } from 'react-native';

import { NativeStackHeaderItemCustom, NativeStackHeaderItemProps } from '@react-navigation/native-stack';

import { I18n } from '~/app/i18n';
import { headerAction, modalScreenOptions } from '~/app/navigation/util';
import { RichEditorForm } from '~/framework/components/inputs/rich-text';
import { LoadingIndicator } from '~/framework/components/loading';
import toast from '~/framework/components/toast';
import { withSession } from '~/framework/modules/auth/util';
import { communitiesRouteNames } from '~/framework/modules/communities/navigation';
import { createMessage, getMessages, MESSAGES_PAGE_SIZE, updateMessage } from '~/framework/modules/communities/service/discussions';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';

import styles from './styles';
import { CommunitiesDiscussionMessageEditorScreen } from './types';

const UPLOAD_PARAMS = { parent: 'protected' } as const;

const PREVENT_BACK_I18N = {
  text: 'comment-preventback-alert-text',
  title: 'comment-preventback-alert-title',
};

export const DiscussionMessageEditorScreenOptions = modalScreenOptions('fullScreenModal', ({ route }) => ({
  title: I18n.get(
    (route.params as CommunitiesDiscussionMessageEditorScreen.NavParams | undefined)?.messageId
      ? 'communities-discussion-message-edit-title'
      : 'communities-discussion-message-create-title',
  ),
}));

const isEmptyContent = (html: string) => !extractTextFromHtml(html) && !html.includes('<img');

export default withSession<CommunitiesDiscussionMessageEditorScreen.AllProps>(function DiscussionMessageEditorScreen({
  navigation,
  route: {
    params: { communityId, discussionId, messageId, page = 0 },
  },
  session,
}) {
  // Content of the message to edit, loaded again from its page. Undefined while loading.
  const [initialContentHtml, setInitialContentHtml] = React.useState<string | undefined>(messageId === undefined ? '' : undefined);
  const [content, setContent] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (messageId === undefined) return;
    let cancelled = false;
    getMessages(session, communityId, discussionId, page, MESSAGES_PAGE_SIZE)
      .then(({ messages }) => {
        if (cancelled) return;
        const message = messages.find(m => m.id === messageId);
        if (!message || message.deleted) throw new Error(`Message ${messageId} not found in page ${page}`);
        setInitialContentHtml(message.htmlContent);
        setContent(message.htmlContent);
      })
      .catch(e => {
        if (cancelled) return;
        console.error('Error while loading community discussion message', e);
        toast.showError();
        if (navigation.canGoBack()) navigation.goBack();
      });
    return () => {
      cancelled = true;
    };
  }, [communityId, discussionId, messageId, navigation, page, session]);

  const onSend = React.useCallback(async () => {
    Keyboard.dismiss();
    try {
      setSaving(true);
      const htmlContent = content.trim();
      if (messageId === undefined) {
        const created = await createMessage(session, communityId, discussionId, htmlContent);
        navigation.popTo(communitiesRouteNames.discussionDetails, {
          communityId,
          discussionId,
          lastMutation: { at: Date.now(), messageId: created.id, type: 'created' },
        });
      } else {
        await updateMessage(session, communityId, discussionId, messageId, htmlContent);
        navigation.popTo(communitiesRouteNames.discussionDetails, {
          communityId,
          discussionId,
          lastMutation: { at: Date.now(), messageId, type: 'updated' },
        });
      }
    } catch (e) {
      console.error('Error while sending community discussion message', e);
      toast.showError();
      setSaving(false);
    }
  }, [communityId, content, discussionId, messageId, navigation, session]);

  React.useEffect(() => {
    const sendItem = (props: NativeStackHeaderItemProps): NativeStackHeaderItemCustom =>
      saving
        ? {
            element: <LoadingIndicator small customColor={props.tintColor} customStyle={styles.headerLoader} />,
            type: 'custom',
          }
        : headerAction(
            { disabled: isEmptyContent(content), icon: 'ui-send', onPress: onSend, testID: 'discussion-header-send' },
            props,
          );
    navigation.setOptions({
      headerRight: props => sendItem(props).element,
      unstable_headerRightItems: props => [sendItem(props)],
    });
  }, [content, navigation, onSend, saving]);

  if (initialContentHtml === undefined) return <LoadingIndicator />;

  return (
    <RichEditorForm
      topForm={null}
      initialContentHtml={initialContentHtml}
      uploadParams={UPLOAD_PARAMS}
      onChangeText={setContent}
      preventBackI18n={PREVENT_BACK_I18N}
      saving={saving}
      pageStyle={styles.page}
      placeholder={I18n.get('communities-discussion-message-add')}
      testID="discussion-message-content"
    />
  );
});
