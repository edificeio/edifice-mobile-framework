import * as React from "react"
import { Text } from "react-native"
import { PageContainer } from "../../ui/ContainerContent";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { connect } from "react-redux";
import { Back } from "../../ui/headers/Back";
import { Title, Header } from "../../ui/headers/Header";
import I18n from 'react-native-i18n';
import { H4 } from "../../ui/Typography";
import { loadNotificationsPrefs } from '../actions/loadNotificationsPrefs';
import { NotifPrefLine } from "../components/NotifPrefLine";

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
    notificationsPrefs: any
}, undefined> {

    componentDidMount(){
        this.props.loadNotificationsPrefs();
    }

	public render() {
		return (
			<PageContainer>
				<ConnectionTrackingBar />
                <H4>{ I18n.t('directory-notificationsTitle') }</H4>
                { this.props.notificationsPrefs.map(pref => <NotifPrefLine i18nKey={ pref.key } frequency={ pref.defaultFrequency } />) }
			</PageContainer>
		)
	}
}

export default connect(
    (state: any) => { console.log(state); return ({
        notificationsPrefs: state.auth.notificationsPrefs
    })}, 
    dispatch => ({
        loadNotificationsPrefs: () => loadNotificationsPrefs(dispatch)()
    })
)(NotificationsSettings)