import * as React from "react"
import { Text, ScrollView, ActivityIndicator } from "react-native"
import { PageContainer } from "../../ui/ContainerContent";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { connect } from "react-redux";
import { Back } from "../../ui/headers/Back";
import { Title, Header } from "../../ui/headers/Header";
import I18n from 'react-native-i18n';
import { H4 } from "../../ui/Typography";
import { loadNotificationsPrefs } from '../actions/loadNotificationsPrefs';
import { NotifPrefLine } from "../components/NotifPrefLine";
import { setNotificationPref } from "../actions/setNotificationPref";
import { CommonStyles } from "../../styles/common/styles";
import { Loading } from "../../ui";

export class NotificationsSettingsHeader extends React.Component<{ 
    navigation: any
}, undefined> {
    render(){
        return <Header>
        <Back navigation={ this.props.navigation } />
        <Title>{ I18n.t('directory-notificationsTitle') }</Title>
    </Header>
    }
}

export class NotificationsSettings extends React.Component<{ 
    navigation: any, 
    loadNotificationsPrefs: () => Promise<void>,
    notificationsPrefs: any,
    availableApps: any,
    setNotificationPref: (notification, value, notificationsPrefs) => Promise<void>
}, undefined> {

    componentDidMount(){
        this.props.loadNotificationsPrefs();
    }

    setPref(pref, value){
        this.props.setNotificationPref(pref, value, this.props.notificationsPrefs);
    }

	public render() {
        if(this.props.notificationsPrefs.length === 0){
            return <Loading />;
        }
		return (
			<PageContainer>
				<ConnectionTrackingBar />
                <ScrollView>
                    <H4>{ I18n.t('directory-notificationsTitle') }</H4>
                    { this.props.notificationsPrefs.filter(nn => this.props.availableApps.hasOwnProperty(nn.type)).map(pref => <NotifPrefLine 
                        key={ pref.key }
                        i18nKey={ pref.key } 
                        value={ pref['push-notif'] } 
                        onCheck={ () => this.setPref(pref, true)}
                        onUncheck={ () => this.setPref(pref, false) } />
                    ) }
                </ScrollView>
			</PageContainer>
		)
	}
}

export default connect(
    (state: any) => { console.log(state); return ({
        notificationsPrefs: state.auth.notificationsPrefs,
        availableApps: state.timeline.selectedApps
    })}, 
    dispatch => ({
        loadNotificationsPrefs: () => loadNotificationsPrefs(dispatch)(),
        setNotificationPref: (notification, pref, notificationsPrefs) => setNotificationPref(dispatch)(notification, pref, notificationsPrefs)
    })
)(NotificationsSettings)