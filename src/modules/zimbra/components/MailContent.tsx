import I18n from 'i18n-js';
import * as React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { LoadingIndicator } from '~/framework/components/loading';
import { getUserSession } from '~/framework/util/session';
import { DraftType } from '~/modules/zimbra/screens/NewMail';
import { IMail } from '~/modules/zimbra/state/mailContent';
import { getUserColor } from '~/modules/zimbra/utils/userColor';
import { PageContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';

import { FooterButton, HeaderMail, HeaderMailDetails, RenderPJs } from './MailContentItems';

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
  topBar: {
    width: '100%',
    height: 12,
  },
  shadowContainer: {
    flexGrow: 1,
    marginTop: UI_SIZES.spacing.tiny,
    marginBottom: 0,
    flexDirection: 'column-reverse',
    backgroundColor: theme.palette.grey.white,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: theme.palette.grey.white,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  marginView: {
    height: 110,
  },
  scrollAlign: {
    height: 1,
  },
  scrollContent: {
    padding: UI_SIZES.spacing.small,
  },
  containerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    zIndex: 10,
    elevation: 10,
  },
});

type MailContentProps = {
  navigation: any;
  mail: IMail;
  isFetching: boolean;
  error?: Error;
  restore: (mailIds: string[]) => void;
  delete: (mailIds: string[]) => void;
  checkStorage: () => boolean;
  onHtmlError: () => void;
};

const GetTopBarColor = ({ senderId, receiverId }) => {
  const userId = getUserSession().user.id === senderId ? receiverId : senderId;
  const [color, setColor] = React.useState<string>();
  getUserColor(userId).then(setColor);
  return color ? <View style={[styles.topBar, { backgroundColor: color }]} /> : <View />;
};

export default class MailContent extends React.PureComponent<MailContentProps, any> {
  constructor(props) {
    super(props);

    this.state = {
      detailsVisible: false,
      htmlError: false,
    };
  }

  private renderError() {
    return <EmptyContentScreen />;
  }

  private mailFooterTrash() {
    return (
      <View style={styles.containerFooter}>
        <FooterButton icon="delete-restore" text={I18n.t('zimbra-restore')} onPress={this.props.restore} />
        <FooterButton icon="delete" text={I18n.t('zimbra-delete')} onPress={this.props.delete} />
      </View>
    );
  }

  private mailFooter() {
    const { checkStorage } = this.props;
    return (
      <View style={styles.containerFooter}>
        <FooterButton
          icon="reply"
          text={I18n.t('zimbra-reply')}
          onPress={() =>
            checkStorage() &&
            this.props.navigation.navigate('newMail', {
              type: DraftType.REPLY,
              mailId: this.props.mail.id,
              onGoBack: this.props.navigation.state.params.onGoBack,
            })
          }
        />
        <FooterButton
          icon="reply_all"
          text={I18n.t('zimbra-replyAll')}
          onPress={() =>
            checkStorage() &&
            this.props.navigation.navigate('newMail', {
              type: DraftType.REPLY_ALL,
              mailId: this.props.mail.id,
              onGoBack: this.props.navigation.state.params.onGoBack,
            })
          }
        />
        <FooterButton
          icon="forward"
          text={I18n.t('zimbra-forward')}
          onPress={() =>
            checkStorage() &&
            this.props.navigation.navigate('newMail', {
              type: DraftType.FORWARD,
              mailId: this.props.mail.id,
              onGoBack: this.props.navigation.state.params.onGoBack,
            })
          }
        />
        <FooterButton icon="delete" text={I18n.t('zimbra-delete')} onPress={this.props.delete} />
      </View>
    );
  }

  private mailContent() {
    const { mail, onHtmlError } = this.props;
    const htmlOpts = {
      selectable: true,
    };
    return (
      <View style={styles.shadowContainer}>
        <View style={styles.marginView} />
        <View style={styles.scrollContainer}>
          <ScrollView style={styles.scrollAlign} contentContainerStyle={styles.scrollContent}>
            {mail.body ? (
              <HtmlContentView
                onHtmlError={() => {
                  onHtmlError();
                  this.setState({ htmlError: true });
                }}
                html={mail.body}
                opts={htmlOpts}
              />
            ) : null}
          </ScrollView>
        </View>
      </View>
    );
  }

  private mailHeader(setDetailsVisibility: (v: boolean) => void) {
    return (
      <View>
        <HeaderMail mailInfos={this.props.mail} setDetailsVisibility={setDetailsVisibility} />
      </View>
    );
  }

  public render() {
    const { navigation, error } = this.props;
    const { htmlError } = this.state;
    return (
      <PageContainer>
        <SafeAreaView style={styles.fullContainer}>
          {this.props.isFetching ? (
            <LoadingIndicator />
          ) : error || htmlError ? (
            this.renderError()
          ) : (
            <View style={styles.fullContainer}>
              {this.props.mail.id && <GetTopBarColor senderId={this.props.mail.from} receiverId={this.props.mail.to[0]} />}
              {this.props.mail.id &&
                this.mailHeader(v => {
                  this.setState({ detailsVisible: v });
                })}
              {this.props.mail.hasAttachment && (
                <RenderPJs
                  attachments={this.props.mail.attachments}
                  mailId={this.props.mail.id}
                  navigation={this.props.navigation}
                  onDownload={this.props.downloadAttachment}
                  dispatch={this.props.dispatch}
                />
              )}
              {this.props.mail.body !== undefined && this.mailContent()}
              {navigation.getParam('isTrashed') || navigation.state.routeName === 'trash'
                ? this.mailFooterTrash()
                : this.mailFooter()}
              {this.state.detailsVisible && (
                <HeaderMailDetails
                  mailInfos={this.props.mail}
                  setDetailsVisibility={v => {
                    this.setState({ detailsVisible: v });
                  }}
                />
              )}
            </View>
          )}
        </SafeAreaView>
      </PageContainer>
    );
  }
}
