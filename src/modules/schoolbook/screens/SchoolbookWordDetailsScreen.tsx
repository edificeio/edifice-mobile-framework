import * as React from "react";
import { View, ScrollView, RefreshControl, Linking } from "react-native";
import { NavigationInjectedProps, NavigationActions, NavigationStateRoute, StackActions } from "react-navigation";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";
import I18n from "i18n-js";

import type { IGlobalState } from "../../../AppStore";

import moduleConfig from "../moduleConfig";
import withViewTracking from "../../../framework/tracker/withViewTracking";
import { PageView } from "../../../framework/components/page";
import { IResourceUriNotification, ITimelineNotification } from "../../../framework/notifications";
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderSubtitle, HeaderTitle } from "../../../framework/components/header";
import NotificationTopInfo from "../../../framework/modules/timelinev2/components/NotificationTopInfo";
import { Trackers } from "../../../framework/tracker";
import Conf from "../../../../ode-framework-conf";
import { HtmlContentView } from "../../../ui/HtmlContentView";
import { LoadingIndicator } from "../../../framework/components/loading";
import { TextItalic } from "../../../framework/components/text";
import theme from "../../../framework/theme";
import { ButtonsOkCancel, FlatButton } from "../../../ui";
import { ModalBox, ModalContent, ModalContentBlock, ModalContentText } from "../../../ui/Modal";
import { Icon } from "../../../framework/components/icon";
import { getSchoolbookWordDetailsAction, acknowledgeSchoolbookWordAction } from "../actions";
import { schoolbookUriCaptureFunction } from "../service";
import { getAcknowledgeNamesForChild, getAcknowledgeNumber, getIsWordAcknowledgedForParent, getUnacknowledgedChildrenIdsForParent, ISchoolbookWordReport } from "../reducer";
import { getUserSession, IUserSession, UserType } from "../../../framework/session";
import { createStackNavigator } from "react-navigation-stack";

// TYPES ==========================================================================================

export interface ISchoolbookWordDetailsScreenDataProps {
  session: IUserSession;
};
export interface ISchoolbookWordDetailsScreenEventProps {
  handleGetSchoolbookWordDetails(schoolbookWordId: string): Promise<ISchoolbookWordReport | undefined>;
  handleAcknowledgeSchoolbookWord(schoolbookWordId: ISchoolbookWordReport): Promise<void>;
};
export interface ISchoolbookWordDetailsScreenNavParams {
  notification: ITimelineNotification & IResourceUriNotification;
};
export interface ISchoolbookWordDetailsScreenInternalNavParams {
  confirmBackSchoolbook: boolean;
  _forceBack: boolean;
  _isAck: boolean;
};
export type ISchoolbookWordDetailsScreenProps = ISchoolbookWordDetailsScreenDataProps
  & ISchoolbookWordDetailsScreenEventProps
  & NavigationInjectedProps<Partial<ISchoolbookWordDetailsScreenNavParams>>
  & NavigationInjectedProps<Partial<ISchoolbookWordDetailsScreenInternalNavParams>>;

export enum SchoolbookWordDetailsLoadingState {
  PRISTINE, INIT, REFRESH, DONE
}
export interface ISchoolbookWordDetailsScreenState {
  loadingState: SchoolbookWordDetailsLoadingState;
  ackLoadingState: boolean;
  schoolbookWordData: ISchoolbookWordReport | undefined;
  errorState: boolean;
};

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
    errorState: false
  }

  // RENDER =======================================================================================

  render() {
    const { navigation, session } = this.props;
    const { type } = session.user;
    const { schoolbookWordData, loadingState, errorState } = this.state;
    const confirmBackSchoolbook = navigation.getParam("confirmBackSchoolbook");
    const isRelative = type === UserType.RELATIVE;
    return (
      <>
        {this.renderHeader()}
        <PageView>
          {schoolbookWordData && isRelative
            ? <ModalBox
              backdropOpacity={0.5}
              isVisible={confirmBackSchoolbook || false}
            >
              {this.renderBackModal()}
            </ModalBox>
            : null
          }
          {[SchoolbookWordDetailsLoadingState.PRISTINE, SchoolbookWordDetailsLoadingState.INIT].includes(loadingState)
            ? <LoadingIndicator />
            : errorState || !schoolbookWordData
              ? this.renderError()
              : this.renderContent(schoolbookWordData)
          }
        </PageView>
      </>
    );
  }

  renderHeader() {
    const { navigation } = this.props;
    const { schoolbookWordData } = this.state;
    return (
      <FakeHeader>
        <HeaderRow>
          <HeaderLeft>
            <HeaderAction iconName="back" onPress={() => navigation.navigate("timeline")} />
          </HeaderLeft>
          <HeaderCenter>
            {schoolbookWordData?.word?.title
              ? <>
                <HeaderTitle>{schoolbookWordData?.word?.title}</HeaderTitle>
                <HeaderSubtitle>{I18n.t("schoolbook.schoolbookWordDetailsScreen.title")}</HeaderSubtitle>
              </>
              : <HeaderTitle>{I18n.t("schoolbook.schoolbookWordDetailsScreen.title")}</HeaderTitle>
            }
          </HeaderCenter>
        </HeaderRow>
      </FakeHeader>
    );
  }

  renderError() {
    return <TextItalic>{"Error"}</TextItalic> // ToDo: great error screen here
  }

  renderContent(schoolbookWordData: ISchoolbookWordReport) {
    const { session } = this.props;
    const { type } = session.user;
    const { loadingState } = this.state;
    const isRelative = type === UserType.RELATIVE;
    return (
      <>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 12,
            paddingHorizontal: 16,
            paddingBottom: isRelative ? 80 : undefined,
            backgroundColor: theme.color.background.card
          }}
          refreshControl={
            <RefreshControl
              refreshing={[SchoolbookWordDetailsLoadingState.REFRESH, SchoolbookWordDetailsLoadingState.INIT].includes(loadingState)}
              onRefresh={() => this.doRefresh()}
            />
          }
        >
          {this.renderSchoolbookWordDetails(schoolbookWordData)}
        </ScrollView>
        {isRelative ? this.renderAckButton(schoolbookWordData) : null}
      </>
    );
  }

  renderSchoolbookWordDetails(schoolbookWordData: ISchoolbookWordReport) {
    const { navigation } = this.props;
    const notification = navigation.getParam("notification");
    const resourceUri = notification?.resource.uri;
    if (!notification || !resourceUri) return this.renderError();

    return (
      <>
        <NotificationTopInfo notification={notification} />
        {this.renderSchoolbookWordAckState(schoolbookWordData)}
        <HtmlContentView
          html={schoolbookWordData.word.text}
          onDownload={() => Trackers.trackEvent("Schoolbook", "DOWNLOAD ATTACHMENT", "Read mode")}
          onError={() => Trackers.trackEvent("Schoolbook", "DOWNLOAD ATTACHMENT ERROR", "Read mode")}
          onDownloadAll={() => Trackers.trackEvent("Schoolbook", "DOWNLOAD ALL ATTACHMENTS", "Read mode")}
          onOpen={() => Trackers.trackEvent("Schoolbook", "OPEN ATTACHMENT", "Read mode")}
        />
        {resourceUri
          ? <View style={{ marginTop: 10 }}>
            <FlatButton
              title={I18n.t("common.openInBrowser")}
              customButtonStyle={{ backgroundColor: theme.color.tertiary.light }}
              customTextStyle={{ color: theme.color.secondary.regular }}
              onPress={() => {
                //TODO: create generic function inside oauth (use in myapps, etc.)
                if (!Conf.currentPlatform) {
                  console.warn("Must have a platform selected to redirect the user");
                  return null;
                }
                const url = `${(Conf.currentPlatform as any).url}${resourceUri}`;
                Linking.canOpenURL(url).then(supported => {
                  if (supported) {
                    Linking.openURL(url);
                  } else {
                    console.warn("[schoolbook] Don't know how to open URI: ", url);
                  }
                });
                Trackers.trackEvent("Schoolbook", "GO TO", "View in Browser");
              }}
            />
          </View>
          : null
        }
      </>
    );
  }

  renderAckButton(schoolbookWordData: ISchoolbookWordReport) {
    const { session } = this.props;
    const { id } = session.user
    const { ackLoadingState } = this.state;
    const isWordAcknowledged = getIsWordAcknowledgedForParent(id, schoolbookWordData);
    return (
      <View
        style={{
          alignSelf: "center",
          paddingVertical: 20,
          position: "absolute",
          bottom: 0
        }}
      >
        {isWordAcknowledged
          ? <View
            style={{
              width: 25,
              height: 25,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.color.secondary.regular
            }}
          >
            <Icon size={15} name="checked" color={theme.color.text.inverse} />
          </View>
          : <FlatButton
            onPress={() => this.doAcknowledge()}
            title={I18n.t("schoolbook.schoolbookWordDetailsScreen.acknowledge")}
            loading={ackLoadingState}
          />
        }
      </View>
    );
  }

  renderSchoolbookWordAckState(schoolbookWordData: ISchoolbookWordReport) {
    const { session } = this.props;
    const { type, id } = session.user;
    let ackStateText: string | React.ReactElement | undefined;
    switch (type) {
      case UserType.STUDENT:
        const ackNames = getAcknowledgeNamesForChild(id, schoolbookWordData);
        ackStateText = ackNames && ackNames.length
          ? <>
              {I18n.t("schoolbook.schoolbookWordDetailsScreen.readBy")}
              {" "}
              {ackNames?.join(I18n.t("schoolbook.schoolbookWordDetailsScreen.readBySeparator"))}
            </>
          : I18n.t("schoolbook.schoolbookWordDetailsScreen.mustRead");
        break;
      case UserType.RELATIVE:
        const unAckChildren = getUnacknowledgedChildrenIdsForParent(id, schoolbookWordData);
        ackStateText = unAckChildren.length
          ? undefined
          : I18n.t("schoolbook.schoolbookWordDetailsScreen.alreadyConfirmed");
        break;
      case UserType.PERSONNEL:
      case UserType.TEACHER:
        const ackNumber = getAcknowledgeNumber(schoolbookWordData);
        ackStateText = I18n.t(`schoolbook.schoolbookWordDetailsScreen.readByNumberRelative${ackNumber === 1 ? "" : "s"}`, { nb: ackNumber });
    };
    return ackStateText
      ? <TextItalic style={{ color: theme.color.text.light }}>
          <Icon
            name="eye"
            color={theme.color.text.light}
            paddingHorizontal={12}
          />{" "}
          {ackStateText}
        </TextItalic>
      : null;
  }

  renderBackModal() {
    const { navigation } = this.props;
    return (
      <ModalContent>
        <ModalContentBlock>
          <ModalContentText>
            {I18n.t("schoolbook.schoolbookWordDetailsScreen.backWithoutAckConfirm")}
          </ModalContentText>
        </ModalContentBlock>
        <ModalContentBlock>
          <ButtonsOkCancel
            onCancel={() => {
              navigation.setParams({
                confirmBackSchoolbook: false,
                _forceBack: true
              });
              requestAnimationFrame(() => {
                navigation.dispatch(NavigationActions.back({ immediate: true }));
              });
            }}
            onValid={async () => {
              navigation.setParams({
                confirmBackSchoolbook: false,
                _forceBack: true
              });
              await this.doAcknowledge();
              requestAnimationFrame(() => {
                navigation.dispatch(NavigationActions.back({ immediate: true }));
              });
            }}
            title={I18n.t("schoolbook.schoolbookWordDetailsScreen.acknowledge")}
            cancelText={I18n.t("schoolbook.schoolbookWordDetailsScreen.backWithoutAck")}
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
      const notification = navigation.getParam("notification");
      const resourceUri = notification?.resource.uri;
      if (!resourceUri) {
        throw new Error("[doGetSchoolbookWordDetails] failed to call api (resourceUri is undefined)");
      }
      const { wordId } = schoolbookUriCaptureFunction(resourceUri);
      if (!wordId) {
        throw new Error(`[doGetSchoolbookWordDetails] failed to capture resourceUri "${resourceUri}": ${{ wordId }}`);
      }
      const schoolbookWordData = await handleGetSchoolbookWordDetails(wordId);
      if (!schoolbookWordData) {
        throw new Error("[doGetSchoolbookWordDetails] failed to retrieve the schoolbook word report");
      }
      this.setState({ schoolbookWordData });

      // Set nav state depending of schoolbook word data
      if (type !== UserType.RELATIVE) {
        !navigation.getParam('_forceBack') && navigation.setParams({ _forceBack: true });
      } else if (getIsWordAcknowledgedForParent(id, schoolbookWordData)) {
        !navigation.getParam('_isAck') && navigation.setParams({ _isAck: true });
      }
    } catch (e) {
      // ToDo: Error handling
      this.setState({ errorState: true });
      console.warn(`[${moduleConfig.name}] doGetSchoolbookWordDetails failed`, e);
    }
  }

  async doAcknowledgeChildren() {
    try {
      const { navigation, handleAcknowledgeSchoolbookWord } = this.props;
      const { schoolbookWordData } = this.state;
      if (!schoolbookWordData) {
        throw new Error("[doAcknowledgeChildren] no schoolbookWordData");
      }
      await handleAcknowledgeSchoolbookWord(schoolbookWordData);
      Trackers.trackEvent('Schoolbook', 'CONFIRM');
      navigation.setParams({ _isAck: true });
      await this.doGetSchoolbookWordDetails();
    } catch (e) {
      // ToDo: Error handling
      console.warn(`[${moduleConfig.name}] doAcknowledgeChildren failed`, e);
    }
  }
}

// UTILS ==========================================================================================

// Add some util functions here

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => ISchoolbookWordDetailsScreenDataProps = (s) => {
  return {
    session: getUserSession(s)
  };
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => ISchoolbookWordDetailsScreenEventProps = (dispatch, getState) => ({
  handleGetSchoolbookWordDetails: async (schoolbookWordId: string) => { return await dispatch(getSchoolbookWordDetailsAction(schoolbookWordId)) as unknown as ISchoolbookWordReport | undefined; }, // TS BUG: dispatch mishandled
  handleAcknowledgeSchoolbookWord: async (schoolbookWord: ISchoolbookWordReport) => { return await dispatch(acknowledgeSchoolbookWordAction(schoolbookWord)) as unknown as void; }
})

const SchoolbookWordDetailsScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(SchoolbookWordDetailsScreen);
const SchoolbookWordDetailsScreen_Managed = withViewTracking("schoolbook/details")(SchoolbookWordDetailsScreen_Connected);

// ROUTER =========================================================================================

export const SchoolbookWordDetailsScreenRouter = createStackNavigator(
  {
    SchoolbookWordDetailsScreenRouter: {
      screen: SchoolbookWordDetailsScreen_Managed,
    }
  },
  {
    initialRouteName: "SchoolbookWordDetailsScreenRouter",
    headerMode: 'none'
  }
);

const defaultGetStateForAction = SchoolbookWordDetailsScreenRouter.router.getStateForAction;

SchoolbookWordDetailsScreenRouter.router.getStateForAction = (action, state: NavigationStateRoute<any>) => {
  if (
    state?.routeName === 'schoolbook/details'
    && (
      (
        action.type === NavigationActions.NAVIGATE
        && state?.routeName === 'schoolbook/details'
        && action.routeName === 'timeline'
      )
      || action.type === NavigationActions.BACK
      || action.type === StackActions.POP
    )
  ) {

    if (state?.routes?.[0]?.params?._forceBack || state?.routes?.[0]?.params?._isAck) {
      return defaultGetStateForAction(action, state);
    }

    return defaultGetStateForAction(
      NavigationActions.setParams({
        key: state.routes[0].key,
        params: { confirmBackSchoolbook: true }
      }),
      state
    );
  }

  return defaultGetStateForAction(action, state);
}
