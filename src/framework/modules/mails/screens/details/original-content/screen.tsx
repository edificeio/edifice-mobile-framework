import * as React from 'react';

import type { NativeStackNavigationOptions, NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';
import { MailsDetailsOriginalContentScreenPrivateProps } from './types';

import { EmptyContentScreen } from '~/framework/components/empty-screens';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { ContentLoader } from '~/framework/hooks/loader';
import { MailsNavigationParams, mailsRouteNames } from '~/framework/modules/mails/navigation';
import { mailsService } from '~/framework/modules/mails/service';
import { navBarOptions } from '~/framework/navigation/navBar';
import HtmlContentView from '~/ui/HtmlContentView';

export const computeNavBar = ({
  navigation,
  route,
}: NativeStackScreenProps<MailsNavigationParams, typeof mailsRouteNames.originalContent>): NativeStackNavigationOptions => ({
  ...navBarOptions({
    navigation,
    route,
    title: '',
  }),
});

const MailsDetailsOriginalContentScreen = (props: MailsDetailsOriginalContentScreenPrivateProps) => {
  const [content, setContent] = React.useState<string>('');
  const [error, setError] = React.useState<boolean>(false);

  const loadData = async () => {
    try {
      const mailData = await mailsService.mail.get({ id: props.route.params.id, originalFormat: true });
      setContent(mailData.body);
    } catch (e) {
      console.error(e);
    }
  };

  const renderContent = React.useCallback(() => {
    if (error) return <EmptyContentScreen />;
    return (
      <PageView>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
          <HtmlContentView
            testID="message-read-content"
            onHtmlError={() => setError(true)}
            html={content}
            opts={{ selectable: true }}
          />
        </ScrollView>
      </PageView>
    );
  }, [content, error]);

  return <ContentLoader loadContent={loadData} renderContent={renderContent} />;
};

export default MailsDetailsOriginalContentScreen;
