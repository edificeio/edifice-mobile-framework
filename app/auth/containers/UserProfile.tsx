import * as React from "react"
import { Text } from "react-native"
import { ModalContent, ModalBox } from "../../ui/Modal";
import { ButtonsOkCancel } from "../../ui";
import I18n from 'react-native-i18n';
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { ButtonLine } from "../../ui/ButtonLine";
import { connect } from "react-redux";
import { logout } from "../actions/logout";
import { Me } from "../../infra/Me";
import { LightP } from "../../ui/Typography";

export class UserProfile extends React.Component<{ logout: (login: string) => Promise<void>, navigation: any }, { showDisconnect: boolean }> {
	public state = {
		showDisconnect: false,
	}

	public disconnect() {
		this.setState({ showDisconnect: false })
		this.props.logout(Me.session.login)
	}

	public disconnectBox = () => (
		<ModalContent>

			<LightP>{ I18n.t('common-confirm') }</LightP>
			<LightP>{ I18n.t('auth-disconnectConfirm') }</LightP>
			<ButtonsOkCancel
				onCancel={() => this.setState({ showDisconnect: false })}
				onValid={() => this.disconnect()}
				title={ I18n.t('directory-disconnectButton') }
			/>
		</ModalContent>
	)

	public render() {
		return (
			<PageContainer>
				<ConnectionTrackingBar />
				<ModalBox backdropOpacity={0.5} isVisible={this.state.showDisconnect}>
					{this.disconnectBox()}
				</ModalBox>
				<ButtonLine title={ 'directory-notificationsTitle' } onPress={ () => this.props.navigation.navigate('notificationsSettings') } />
				<ButtonLine title={ 'directory-disconnectButton' } hideIcon={ true } color={ "#F64D68" } onPress={() => this.setState({ showDisconnect: true })} />
			</PageContainer>
		)
	}
}

export default connect(state => ({}), dispatch => ({
	logout: (email: string) => logout(dispatch)(email),
}))(UserProfile)