/**
 * Index page for push-notifs settings.
 */

import deepmerge from "deepmerge";
import * as React from "react";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { NavigationInjectedProps, StackActions } from "react-navigation";
import { connect } from "react-redux";
import { IGlobalState } from "../../AppStore";
import { Icon } from "../../framework/components/icon";
import { ListItem } from "../../framework/components/listItem";
import { LoadingIndicator } from "../../framework/components/loading";
import { PageView } from "../../framework/components/page";
import { FontSize, Text, TextAction, TextLight } from "../../framework/components/text";
import { getDefaultPushNotifsSettingsByType, getPushNotifsSettingsByType, IPushNotifsSettingsByType, ITimeline_State } from "../../framework/modules/timelinev2/reducer";
import { IPushNotifsSettings } from "../../framework/modules/timelinev2/reducer/notifSettings/pushNotifsSettings";
import theme from "../../framework/theme";
import timelineModuleConfig from "../../framework/modules/timelinev2/moduleConfig";
import { ThunkDispatch } from "redux-thunk";
import { loadPushNotifsSettingsAction, updatePushNotifsSettingsAction } from "../../framework/modules/timelinev2/actions/notifSettings";
import withViewTracking from "../../framework/tracker/withViewTracking";
import { SafeAreaView, View } from "react-native";
import { Toggle } from "../../framework/components/toggle";
import I18n from "i18n-js";

// TYPES ==========================================================================================

export interface IPushNotifsSettingsScreenDataProps {
	timelineState: ITimeline_State;
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
	PRISTINE, INIT, DONE
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
		const settings = this.props.timelineState.notifSettings.pushNotifsSettings;
		return <>
			<PageView>
				{[PushNotifsSettingsLoadingState.PRISTINE, PushNotifsSettingsLoadingState.INIT].includes(this.state.loadingState)
					? <LoadingIndicator />
					: settings.error && !settings.lastSuccess
						? this.renderError()
						: this.props.navigation.getParam('type')
							? this.renderSubList()
							: this.renderMainList()
				}
			</PageView>
		</>;
	}

	renderMainList() {
		console.log("=== renderMainList")
		const settings = getPushNotifsSettingsByType(this.props.timelineState);
		console.log("settings", settings);
		const defaults = getDefaultPushNotifsSettingsByType(this.props.timelineState);
		console.log("defaults", defaults);
		const items = deepmerge<IPushNotifsSettingsByType>(defaults, settings);
		return <FlatList
			data={Object.entries(items).sort((a, b) => I18n.t(`timeline.appType.${a[0]}`).localeCompare(I18n.t(`timeline.appType.${b[0]}`)))}
			keyExtractor={(item: [string, IPushNotifsSettings]) => item[0]}
			renderItem={({ item }: { item: [string, IPushNotifsSettings] }) => this.renderMainItem(item)}
			ListEmptyComponent={this.renderError}
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
					<Text>{I18n.t(`timeline.appType.${type}`)}</Text>
				}
				rightElement={
					<View style={{flexDirection: 'row'}}>
						<TextAction style={{ fontSize: FontSize.Small }}>{I18n.t(
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
		return <FlatList
			data={Object.entries(items)}
			keyExtractor={(item: [string, boolean]) => item[0]}
			renderItem={({ item }: { item: [string, boolean] }) => this.renderSubItem(item)}
			ListEmptyComponent={this.renderError}
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
		await this.props.handleUpdatePushNotifSettings({ [item[0]]: item[1] });
		this.setState({ pendingPrefsChanges: {} });
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
		await this.props.handleUpdatePushNotifSettings(itemsWithNewValue);
		this.setState({ pendingPrefsChanges: {} });
	}

}

// UTILS ==========================================================================================

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => IPushNotifsSettingsScreenDataProps = (s) => {
	const timelineState = timelineModuleConfig.getState(s) as ITimeline_State;
	return {
		timelineState
	};
};

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => IPushNotifsSettingsScreenEventProps
	= (dispatch, getState) => ({
		handleInitPushNotifsSettings: async () => { await dispatch(loadPushNotifsSettingsAction()) },
		handleUpdatePushNotifSettings: async (changes: IPushNotifsSettings) => { await dispatch(updatePushNotifsSettingsAction(changes)) }
	})

const PushNotifsSettingsScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(PushNotifsSettingsScreen);
export default withViewTracking("user/pushNotifsSettings")(PushNotifsSettingsScreen_Connected);
