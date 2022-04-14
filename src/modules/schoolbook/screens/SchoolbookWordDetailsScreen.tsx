import I18n from 'i18n-js';
import * as React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationActions, NavigationInjectedProps, NavigationStateRoute, StackActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import type { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { EmptyContentScreen } from '~/framework/components/emptyContentScreen';
import { HeaderTitleAndSubtitle } from '~/framework/components/header';
import { Icon } from '~/framework/components/icon';
import { LoadingIndicator } from '~/framework/components/loading';
import { PageView } from '~/framework/components/page';
import { TextItalic } from '~/framework/components/text';
import NotificationTopInfo from '~/framework/modules/timelinev2/components/NotificationTopInfo';
import { DEPRECATED_getCurrentPlatform } from '~/framework/util/_legacy_appConf';
import { openUrl } from '~/framework/util/linking';
import { IResourceUriNotification, ITimelineNotification } from '~/framework/util/notifications';
import { IUserSession, UserType, getUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { acknowledgeSchoolbookWordAction, getSchoolbookWordDetailsAction } from '~/modules/schoolbook/actions';
import moduleConfig from '~/modules/schoolbook/moduleConfig';
import {
  IWordReport,
  getAcknowledgementNamesForStudent,
  getIsWordAcknowledgedForParent,
  getUnacknowledgedStudentIdsForParent,
} from '~/modules/schoolbook/reducer';
import { schoolbookUriCaptureFunction } from '~/modules/schoolbook/service';
import { ButtonsOkCancel } from '~/ui/ButtonsOkCancel';
import { FlatButton } from '~/ui/FlatButton';
import { HtmlContentView } from '~/ui/HtmlContentView';
import { ModalBox, ModalContent, ModalContentBlock, ModalContentText } from '~/ui/Modal';

// TYPES ==========================================================================================

export interface ISchoolbookWordDetailsScreenDataProps {
  session: IUserSession;
}
export interface ISchoolbookWordDetailsScreenEventProps {
  handleGetSchoolbookWordDetails(schoolbookWordId: string): Promise<IWordReport | undefined>;
  handleAcknowledgeSchoolbookWord(schoolbookWordId: IWordReport): Promise<void>;
}
export interface ISchoolbookWordDetailsScreenNavParams {
  notification: ITimelineNotification & IResourceUriNotification;
}
export interface ISchoolbookWordDetailsScreenInternalNavParams {
  confirmBackSchoolbook: boolean;
  _forceBack: boolean;
  _isAck: boolean;
  _error: boolean;
}
export type ISchoolbookWordDetailsScreenProps = ISchoolbookWordDetailsScreenDataProps &
  ISchoolbookWordDetailsScreenEventProps &
  NavigationInjectedProps<Partial<ISchoolbookWordDetailsScreenNavParams>> &
  NavigationInjectedProps<Partial<ISchoolbookWordDetailsScreenInternalNavParams>>;

export enum SchoolbookWordDetailsLoadingState {
  PRISTINE,
  INIT,
  REFRESH,
  DONE,
}
export interface ISchoolbookWordDetailsScreenState {
  loadingState: SchoolbookWordDetailsLoadingState;
  ackLoadingState: boolean;
  schoolbookWordData: IWordReport | undefined;
  errorState: boolean;
}

// COMPONENT ======================================================================================

export class SchoolbookWordDetailsScreen extends React.PureComponent<
  ISchoolbookWordDetailsScreenProps,
  ISchoolbookWordDetailsScreenState
> {
  // DECLARATIONS =================================================================================

  state: ISchoolbookWordDetailsScreenState = {
    loadingState: SchoolbookWordDetailsLoadingState.PRISTINE,
    ackLoadingState: false,
    schoolbookWordData: undefined,
    errorState: false,
  };

  // RENDER =======================================================================================

  render() {
    const { navigation, session } = this.props;
    const { type } = session.user;
    const { schoolbookWordData, loadingState, errorState } = this.state;
    const confirmBackSchoolbook = navigation.getParam('confirmBackSchoolbook');
    const isRelative = type === UserType.Relative;
    const navBarInfo = {
      title: schoolbookWordData?.word?.title ? (
        <HeaderTitleAndSubtitle
          title={schoolbookWordData?.word?.title}
          subtitle={I18n.t('schoolbook.schoolbookWordDetailsScreen.title')}
        />
      ) : (
        I18n.t('schoolbook.schoolbookWordDetailsScreen.title')
      ),
    };
    return (
      <>
        <PageView navigation={navigation} navBarWithBack={navBarInfo}>
          {schoolbookWordData && isRelative ? (
            <ModalBox backdropOpacity={0.5} isVisible={confirmBackSchoolbook || false}>
              {this.renderBackModal()}
            </ModalBox>
          ) : null}
          {[SchoolbookWordDetailsLoadingState.PRISTINE, SchoolbookWordDetailsLoadingState.INIT].includes(loadingState) ? (
            <LoadingIndicator />
          ) : errorState || !schoolbookWordData ? (
            this.renderError()
          ) : (
            this.renderContent(schoolbookWordData)
          )}
        </PageView>
      </>
    );
  }

  renderError() {
    return <EmptyContentScreen />;
  }

  renderContent(schoolbookWordData: IWordReport) {
    const { session } = this.props;
    const { type } = session.user;
    const { loadingState } = this.state;
    const isRelative = type === UserType.Relative;
    return (
      <>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            paddingBottom: isRelative ? 80 : undefined,
            backgroundColor: theme.color.background.card,
          }}
          scrollIndicatorInsets={{ right: 0.001 }} // 🍎 Hack to guarantee scrollbar to be stick on the right edge of the screen.
          refreshControl={
            <RefreshControl
              refreshing={[SchoolbookWordDetailsLoadingState.REFRESH, SchoolbookWordDetailsLoadingState.INIT].includes(
                loadingState,
              )}
              onRefresh={() => this.doRefresh()}
            />
          }>
          <SafeAreaView>{this.renderSchoolbookWordDetails(schoolbookWordData)}</SafeAreaView>
        </ScrollView>
        {isRelative ? this.renderAckButton(schoolbookWordData) : null}
      </>
    );
  }

  renderSchoolbookWordDetails(schoolbookWordData: IWordReport) {
    const { navigation } = this.props;
    const notification = navigation.getParam('notification');
    const resourceUri = notification?.resource.uri;

    return (
      <>
        <NotificationTopInfo notification={notification} />
        {this.renderSchoolbookWordAckState(schoolbookWordData)}
        <HtmlContentView
          html={schoolbookWordData.word.text}
          onHtmlError={() => this.setState({ errorState: true })}
          onDownload={() => Trackers.trackEvent('Schoolbook', 'DOWNLOAD ATTACHMENT', 'Read mode')}
          onError={() => Trackers.trackEvent('Schoolbook', 'DOWNLOAD ATTACHMENT ERROR', 'Read mode')}
          onDownloadAll={() => Trackers.trackEvent('Schoolbook', 'DOWNLOAD ALL ATTACHMENTS', 'Read mode')}
          onOpen={() => Trackers.trackEvent('Schoolbook', 'OPEN ATTACHMENT', 'Read mode')}
        />
        {resourceUri ? (
          <View style={{ marginTop: 10 }}>
            <FlatButton
              title={I18n.t('common.openInBrowser')}
              customButtonStyle={{ backgroundColor: theme.color.neutral.extraLight }}
              customTextStyle={{ color: theme.color.secondary.regular }}
              onPress={() => {
                //TODO: create generic function inside oauth (use in myapps, etc.)
                if (!DEPRECATED_getCurrentPlatform()) {
                  return null;
                }
                const url = `${DEPRECATED_getCurrentPlatform()!.url}${resourceUri}`;
                openUrl(url);
                Trackers.trackEvent('Schoolbook', 'GO TO', 'View in Browser');
              }}
            />
          </View>
        ) : null}
      </>
    );
  }

  renderAckButton(schoolbookWordData: IWordReport) {
    const { session } = this.props;
    const { id } = session.user;
    const { ackLoadingState } = this.state;
    const isWordAcknowledged = getIsWordAcknowledgedForParent(id, schoolbookWordData);
    return (
      <View
        style={{
          alignSelf: 'center',
          position: 'absolute',
          bottom: 0,
        }}>
        <SafeAreaView>
          {isWordAcknowledged ? (
            <View
              style={{
                width: 25,
                height: 25,
                borderRadius: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.color.secondary.regular,
              }}>
              <Icon size={15} name="checked" color={theme.color.text.inverse} />
            </View>
          ) : (
            <FlatButton
              onPress={() => this.doAcknowledge()}
              title={I18n.t('schoolbook.schoolbookWordDetailsScreen.acknowledge')}
              loading={ackLoadingState}
            />
          )}
        </SafeAreaView>
      </View>
    );
  }

  renderSchoolbookWordAckState(schoolbookWordData: IWordReport) {
    const { session } = this.props;
    const { type, id } = session.user;
    let ackStateText: string | React.ReactElement | undefined;
    switch (type) {
      case UserType.Student:
        const ackNames = getAcknowledgementNamesForStudent(id, schoolbookWordData);
        ackStateText =
          ackNames && ackNames.length ? (
            <>
              {I18n.t('schoolbook.schoolbookWordDetailsScreen.readBy')}{' '}
              {ackNames?.join(I18n.t('schoolbook.schoolbookWordDetailsScreen.readBySeparator'))}
            </>
          ) : (
            I18n.t('schoolbook.schoolbookWordDetailsScreen.mustRead')
          );
        break;
      case UserType.Relative:
        const unAckChildren = getUnacknowledgedStudentIdsForParent(id, schoolbookWordData);
        ackStateText = unAckChildren.length ? undefined : I18n.t('schoolbook.schoolbookWordDetailsScreen.alreadyConfirmed');
        break;
      case UserType.Personnel:
      case UserType.Teacher:
        const ackNumber = schoolbookWordData.word?.ackNumber;
        ackStateText = I18n.t(`schoolbook.schoolbookWordDetailsScreen.readByNumberRelative${ackNumber === 1 ? '' : 's'}`, {
          nb: ackNumber,
        });
    }
    return ackStateText ? (
      <TextItalic style={{ color: theme.color.text.light }}>
        <Icon name="eye" color={theme.color.text.light} paddingHorizontal={12} /> {ackStateText}
      </TextItalic>
    ) : null;
  }

  renderBackModal() {
    const { navigation } = this.props;
    return (
      <ModalContent>
        <ModalContentBlock>
          <ModalContentText>{I18n.t('schoolbook.schoolbookWordDetailsScreen.backWithoutAckConfirm')}</ModalContentText>
        </ModalContentBlock>
        <ModalContentBlock>
          <ButtonsOkCancel
            onCancel={() => {
              navigation.setParams({
                confirmBackSchoolbook: false,
                _forceBack: true,
              });
              requestAnimationFrame(() => {
                navigation.dispatch(NavigationActions.back({ immediate: true }));
              });
            }}
            onValid={async () => {
              navigation.setParams({
                confirmBackSchoolbook: false,
                _forceBack: true,
              });
              await this.doAcknowledge();
              requestAnimationFrame(() => {
                navigation.dispatch(NavigationActions.back({ immediate: true }));
              });
            }}
            title={I18n.t('schoolbook.schoolbookWordDetailsScreen.acknowledge')}
            cancelText={I18n.t('schoolbook.schoolbookWordDetailsScreen.backWithoutAck')}
          />
        </ModalContentBlock>
      </ModalContent>
    );
  }

  // LIFECYCLE ====================================================================================

  componentDidMount() {
    this.doInit();
  }

  // METHODS ======================================================================================

  async doInit() {
    try {
      this.setState({ loadingState: SchoolbookWordDetailsLoadingState.INIT });
      await this.doGetSchoolbookWordDetails();
    } finally {
      this.setState({ loadingState: SchoolbookWordDetailsLoadingState.DONE });
    }
  }

  async doRefresh() {
    try {
      this.setState({ loadingState: SchoolbookWordDetailsLoadingState.REFRESH });
      await this.doGetSchoolbookWordDetails();
    } finally {
      this.setState({ loadingState: SchoolbookWordDetailsLoadingState.DONE });
    }
  }

  async doAcknowledge() {
    try {
      this.setState({ ackLoadingState: true });
      await this.doAcknowledgeChildren();
    } finally {
      this.setState({ ackLoadingState: false });
    }
  }

  async doGetSchoolbookWordDetails() {
    try {
      const { session, navigation, handleGetSchoolbookWordDetails } = this.props;
      const { type, id } = session.user;
      const notification = navigation.getParam('notification');
      const resourceUri = notification?.resource.uri;
      if (!resourceUri) {
        throw new Error('[doGetSchoolbookWordDetails] failed to call api (resourceUri is undefined)');
      }
      const { wordId } = schoolbookUriCaptureFunction(resourceUri);
      if (!wordId) {
        throw new Error(`[doGetSchoolbookWordDetails] failed to capture resourceUri "${resourceUri}": ${{ wordId }}`);
      }
      const schoolbookWordData = await handleGetSchoolbookWordDetails(wordId);
      if (!schoolbookWordData) {
        throw new Error('[doGetSchoolbookWordDetails] failed to retrieve the schoolbook word report');
      }
      this.setState({ schoolbookWordData });

      // Set nav state depending of schoolbook word data
      if (type !== UserType.Relative) {
        !navigation.getParam('_forceBack') && navigation.setParams({ _forceBack: true });
      } else if (getIsWordAcknowledgedForParent(id, schoolbookWordData)) {
        !navigation.getParam('_isAck') && navigation.setParams({ _isAck: true });
      }
      this.setState({ errorState: false });
    } catch (e) {
      // ToDo: Error handling
      this.setState({ errorState: true });
      this.props.navigation.setParams({ _error: true });
    }
  }

  async doAcknowledgeChildren() {
    try {
      const { navigation, handleAcknowledgeSchoolbookWord } = this.props;
      const { schoolbookWordData } = this.state;
      if (!schoolbookWordData) {
        throw new Error('[doAcknowledgeChildren] no schoolbookWordData');
      }
      await handleAcknowledgeSchoolbookWord(schoolbookWordData);
      Trackers.trackEvent('Schoolbook', 'CONFIRM');
      navigation.setParams({ _isAck: true });
      await this.doGetSchoolbookWordDetails();
    } catch (e) {
      // ToDo: Error handling
    }
  }
}

// UTILS ==========================================================================================

// Add some util functions here

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => ISchoolbookWordDetailsScreenDataProps = s => {
  return {
    session: getUserSession(s),
  };
};

const mapDispatchToProps: (
  dispatch: ThunkDispatch<any, any, any>,
  getState: () => IGlobalState,
) => ISchoolbookWordDetailsScreenEventProps = (dispatch, getState) => ({
  handleGetSchoolbookWordDetails: async (schoolbookWordId: string) => {
    return (await dispatch(getSchoolbookWordDetailsAction(schoolbookWordId))) as unknown as IWordReport | undefined;
  }, // TS BUG: dispatch mishandled
  handleAcknowledgeSchoolbookWord: async (schoolbookWord: IWordReport) => {
    return (await dispatch(acknowledgeSchoolbookWordAction(schoolbookWord))) as unknown as void;
  },
});

const SchoolbookWordDetailsScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(SchoolbookWordDetailsScreen);
const SchoolbookWordDetailsScreen_Managed = withViewTracking('schoolbook/details')(SchoolbookWordDetailsScreen_Connected); // ToDo: better manage THIS view tracking

// ROUTER =========================================================================================

export const SchoolbookWordDetailsScreenRouter = createStackNavigator(
  {
    SchoolbookWordDetailsScreenRouter: {
      screen: SchoolbookWordDetailsScreen_Managed,
    },
  },
  {
    initialRouteName: 'SchoolbookWordDetailsScreenRouter',
    headerMode: 'none',
  },
);

const defaultGetStateForAction = SchoolbookWordDetailsScreenRouter.router.getStateForAction;

SchoolbookWordDetailsScreenRouter.router.getStateForAction = (action, state: NavigationStateRoute<any>) => {
  if (
    state?.routeName === 'timeline/schoolbook/details' &&
    ((action.type === NavigationActions.NAVIGATE &&
      state?.routeName === 'timeline/schoolbook/details' &&
      action.routeName === 'timeline') ||
      action.type === NavigationActions.BACK ||
      action.type === StackActions.POP)
  ) {
    if (state?.routes?.[0]?.params?._forceBack || state?.routes?.[0]?.params?._isAck || state?.routes?.[0]?.params?._error) {
      return defaultGetStateForAction(action, state);
    }

    return defaultGetStateForAction(
      NavigationActions.setParams({
        key: state.routes[0].key,
        params: { confirmBackSchoolbook: true },
      }),
      state,
    );
  }

  return defaultGetStateForAction(action, state);
};
