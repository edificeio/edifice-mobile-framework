/**
 * Index page for push-notifs settings.
 */

import deepmerge from "deepmerge";
import * as React from "react";
import { Platform, SafeAreaView, View } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { NavigationInjectedProps, StackActions } from "react-navigation";
import { connect } from "react-redux";

import { IGlobalState } from "../../AppStore";
import { Icon } from "../../framework/components/icon";
import { ListItem } from "../../framework/components/listItem";
import { LoadingIndicator } from "../../framework/components/loading";
import { PageView } from "../../framework/components/page";
import { Text, TextAction, TextSizeStyle } from "../../framework/components/text";
import { getDefaultPushNotifsSettingsByType, getPushNotifsSettingsByType, IPushNotifsSettingsByType, ITimeline_State } from "../../framework/modules/timelinev2/reducer";
import pushNotifsSettings, { IPushNotifsSettings } from "../../framework/modules/timelinev2/reducer/notifSettings/pushNotifsSettings";
import theme from "../../app/theme";
import timelineModuleConfig from "../../framework/modules/timelinev2/moduleConfig";
import { ThunkDispatch } from "redux-thunk";
import { loadPushNotifsSettingsAction, updatePushNotifsSettingsAction } from "../../framework/modules/timelinev2/actions/notifSettings";
import withViewTracking from "../../framework/util/tracker/withViewTracking";
import { Toggle } from "../../framework/components/toggle";
import I18n from "i18n-js";
import { getUserSession, IUserSession } from "../../framework/util/session";
import { EmptyContentScreen } from "../../framework/components/emptyContentScreen";
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from "../../framework/components/header";
import Notifier from "../../framework/util/notifier";

// TYPES ==========================================================================================

export interface IPushNotifsSettingsScreenDataProps {
	timelineState: ITimeline_State;
	session: IUserSession;
};

export interface IPushNotifsSettingsScreenEventProps {
	handleInitPushNotifsSettings(): Promise<void>;
	handleUpdatePushNotifSettings(changes: IPushNotifsSettings): Promise<void>;
};

export interface IPushNotifsSettingsScreenNavigationParams {
	type: string;
}

export type IPushNotifsSettingsScreenProps = IPushNotifsSettingsScreenDataProps
	& IPushNotifsSettingsScreenEventProps
	& NavigationInjectedProps<Partial<IPushNotifsSettingsScreenNavigationParams>>;

export enum PushNotifsSettingsLoadingState {
	PRISTINE, INIT, DONE, UPDATE
}

export interface IPushNotifsSettingsScreenState {
	loadingState: PushNotifsSettingsLoadingState; // Holds the initial loading state. further page loading is handled by async.isFetching
	pendingPrefsChanges: IPushNotifsSettings;
};

// COMPONENT ======================================================================================


export class PushNotifsSettingsScreen extends React.PureComponent<
	IPushNotifsSettingsScreenProps,
	IPushNotifsSettingsScreenState
> {

	// DECLARATIONS =================================================================================

	state: IPushNotifsSettingsScreenState = {
		loadingState: PushNotifsSettingsLoadingState.PRISTINE,
		pendingPrefsChanges: {}
	}

	// RENDER =======================================================================================

	render() {
		const { navigation, timelineState, handleUpdatePushNotifSettings } = this.props;
		const { loadingState, pendingPrefsChanges } = this.state;
		const settings = timelineState.notifSettings.pushNotifsSettings;
		const hasPendingPrefsChanges = Object.keys(pendingPrefsChanges).length > 0;
		return <>
			<PageView>
				<FakeHeader>
					<HeaderRow>
						<HeaderLeft>
							{[PushNotifsSettingsLoadingState.UPDATE].includes(loadingState)
								? 	<LoadingIndicator
										small
										customColor={theme.color.neutral.extraLight}
										customStyle={{ justifyContent: "center", paddingHorizontal: 22 }}
									/>
								: 	<HeaderAction
										iconName={Platform.OS === "ios" ? "chevron-left1" : "back"}
										iconSize={24}
										onPress={async () => {
											if (hasPendingPrefsChanges) {
												this.setState({ loadingState: PushNotifsSettingsLoadingState.UPDATE });
												await handleUpdatePushNotifSettings(pendingPrefsChanges);
												this.setState({ pendingPrefsChanges: {}, loadingState: PushNotifsSettingsLoadingState.DONE });
											}
											navigation.goBack()
										}}
									/>
							}
						</HeaderLeft>
						<HeaderCenter>
							<HeaderTitle>{I18n.t("directory-notificationsTitle")}</HeaderTitle>
						</HeaderCenter>
					</HeaderRow>
				</FakeHeader>
				<Notifier id='timeline/push-notifications' />
				{[PushNotifsSettingsLoadingState.PRISTINE, PushNotifsSettingsLoadingState.INIT].includes(loadingState)
					? <LoadingIndicator />
					: settings.error && !settings.lastSuccess
						? this.renderError()
						: navigation.getParam('type')
							? this.renderSubList()
							: this.renderMainList()
				}
			</PageView>
		</>;
	}

	renderMainList() {
		// console.log("=== renderMainList")
		const settings = getPushNotifsSettingsByType(this.props.timelineState);
		// console.log("settings", settings);
		const defaults = getDefaultPushNotifsSettingsByType(this.props.timelineState);
		// console.log("defaults", defaults);
		let items = deepmerge<IPushNotifsSettingsByType>(defaults, settings);
		// console.log("items", items);
		// console.log("entcoreApps", this.props.session.user.entcoreApps);
		// console.log("timeline filters", this.props.timelineState.notifDefinitions.notifFilters);
		items = Object.fromEntries(Object.entries(items).filter(item => {
			const notifFilter = this.props.timelineState.notifDefinitions.notifFilters.data.find(tf => tf.type === item[0]);
			return this.props.session.user.entcoreApps.find(app => !app.name || app.name === notifFilter?.["app-name"]);
		}))
		const mainListData = Object.entries(items) && Object.entries(items).length > 0
			? Object.entries(items).sort((a, b) => translateMainItem(a).localeCompare(translateMainItem(b)))
			: [];
		return <FlatList
			data={mainListData}
			keyExtractor={(item: [string, IPushNotifsSettings]) => item[0]}
			renderItem={({ item }: { item: [string, IPushNotifsSettings] }) => this.renderMainItem(item)}
			ListEmptyComponent={<EmptyContentScreen />}
			alwaysBounceVertical={false}
			ListFooterComponent={<SafeAreaView></SafeAreaView>}
		/>
	}

	renderMainItem(item: [string, IPushNotifsSettings]) {
		const type = item[0];
		const settingsForType = getPushNotifsSettingsByType(this.props.timelineState)[type] || {};
		const defaultsForType = getDefaultPushNotifsSettingsByType(this.props.timelineState)[type] || {};
		const items = deepmerge<IPushNotifsSettings>(defaultsForType, settingsForType);
		const itemsValues = Object.values(items);
		const total = itemsValues.length;
		const totalOn = itemsValues.filter(v => v).length;
		return <TouchableOpacity
			onPress={() => {
				this.props.navigation.dispatch(StackActions.push({
					routeName: 'NotifPrefs',
					params: {
						type: item[0]
					}
				}))
			}}
		>
			<ListItem
				leftElement={
					<Text>{translateMainItem(item)}</Text>
				}
				rightElement={
					<View style={{flexDirection: 'row'}}>
						<TextAction style={{ ...TextSizeStyle.Small }}>{I18n.t(
							`user.pushNotifsSettingsScreen.countOutOfTotal`, {
							count: totalOn,
							total
						})}</TextAction>
						<Icon
							name="arrow_down"
							color={theme.color.secondary.regular}
							style={{ flex: 0, marginLeft: 20, transform: [{ rotate: "270deg" }] }}
						/>
					</View>
				}
			/>
		</TouchableOpacity>;
	}

	renderSubList() {
		console.log("=== renderSubList")
		const type = this.props.navigation.getParam('type')!;
		const settingsForType = getPushNotifsSettingsByType(this.props.timelineState)[type] || {};
		console.log("settingsForType", settingsForType);
		const defaultsForType = getDefaultPushNotifsSettingsByType(this.props.timelineState)[type] || {};
		console.log("defaultsForType", defaultsForType);
		let items = deepmerge<IPushNotifsSettings>(defaultsForType, settingsForType);
		const prefKeysArray = Object.keys(items);
		const pendingForType = Object.fromEntries(Object.entries(this.state.pendingPrefsChanges).filter(([k, v]) => prefKeysArray.includes(k)));
		console.log("pendingForType", pendingForType);
		items = deepmerge<IPushNotifsSettings>(items, pendingForType);
		const areAllChecked = Object.values(items).every(v => v);
		console.log("areAllChecked", areAllChecked);
		const subListData = Object.entries(items) && Object.entries(items).length > 0
			? Object.entries(items).sort((a, b) => I18n.t(`timeline.notifType.${a[0]}`).localeCompare(I18n.t(`timeline.notifType.${b[0]}`)))
			: [];
		return <FlatList
			data={subListData}
			keyExtractor={(item: [string, boolean]) => item[0]}
			renderItem={({ item }: { item: [string, boolean] }) => this.renderSubItem(item)}
			ListEmptyComponent={<EmptyContentScreen />}
			alwaysBounceVertical={false}
			ListFooterComponent={<SafeAreaView></SafeAreaView>}
			ListHeaderComponent={<ListItem
				leftElement={
					<Text>{I18n.t('common.all')}</Text>
				}
				rightElement={
					<Toggle checked={areAllChecked} onCheckChange={
						() => {
							console.log("toggle all", !areAllChecked);
							this.doTogglePushNotifSettingForAppType(type, !areAllChecked);
						}
					} />
				}
			/>}
		/>
	}

	renderSubItem(item: [string, boolean]) {
		return <ListItem
			leftElement={
				<Text>{I18n.t(`timeline.notifType.${item[0]}`, {
					// defaultValue: item[0]
				})}</Text>
			}
			rightElement={
				<Toggle checked={item[1]} onCheckChange={
					() => {
						console.log("toggle", [item[0], !item[1]]);
						this.doTogglePushNotifSetting([item[0], !item[1]]);
					}
				} />
			}
		/>;
	}

	renderError() {
		return <>
			<Text>{`Error: ${this.props.timelineState.notifSettings.pushNotifsSettings.error?.name}`}</Text>
			<Text>{`Error: ${this.props.timelineState.notifDefinitions.notifTypes.error?.name}`}</Text>
		</> // ToDo: great error screen here
	}

	// LIFECYCLE ====================================================================================

	componentDidMount() {
		this.doInit();
	}

	// METHODS ======================================================================================

	async doInit() {
		if (!this.props.navigation.getParam('type')) {
			try {
				this.setState({ loadingState: PushNotifsSettingsLoadingState.INIT });
				await this.props.handleInitPushNotifsSettings();
			} finally {
				this.setState({ loadingState: PushNotifsSettingsLoadingState.DONE });
			}
		} else {
			this.setState({ loadingState: PushNotifsSettingsLoadingState.DONE });
		}
	}

	async doTogglePushNotifSetting(item: [string, boolean]) {
		console.log("=== doTogglePushNotifSetting")
		this.setState({
			pendingPrefsChanges: {
				...this.state.pendingPrefsChanges,
				[item[0]]: item[1]
			}
		}) 
	}

	async doTogglePushNotifSettingForAppType(type: string, value: boolean) {
		const settingsForType = getPushNotifsSettingsByType(this.props.timelineState)[type] || {};
		const defaultsForType = getDefaultPushNotifsSettingsByType(this.props.timelineState)[type] || {};
		const items = deepmerge<IPushNotifsSettings>(defaultsForType, settingsForType);
		const itemsWithNewValue = Object.fromEntries(Object.keys(items).map(k => [k, value]));
		this.setState({
			pendingPrefsChanges: {
				...this.state.pendingPrefsChanges,
				...itemsWithNewValue
			}
		})
	}

}

// UTILS ==========================================================================================

const translateMainItem = (item: [string, IPushNotifsSettings]) => {
	const backupMissingTranslation = I18n.missingTranslation;
	I18n.missingTranslation = function (scope, options) { return undefined; }
	const t = I18n.t(`timeline.PushNotifsSettingsScreen.appType-override.${item[0]}`);
	I18n.missingTranslation = backupMissingTranslation;
	return t || I18n.t(`timeline.appType.${item[0]}`);
}

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => IPushNotifsSettingsScreenDataProps = (s) => {
	const timelineState = timelineModuleConfig.getState(s) as ITimeline_State;
	const session = getUserSession(s);
	return {
		timelineState,
		session
	};
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => IPushNotifsSettingsScreenEventProps
	= (dispatch, getState) => ({
		handleInitPushNotifsSettings: async () => { await dispatch(loadPushNotifsSettingsAction()) },
		handleUpdatePushNotifSettings: async (changes: IPushNotifsSettings) => { await dispatch(updatePushNotifsSettingsAction(changes)) }
	})

const PushNotifsSettingsScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(PushNotifsSettingsScreen);
export default withViewTracking("user/pushNotifsSettings")(PushNotifsSettingsScreen_Connected);
