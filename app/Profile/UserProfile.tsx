import * as React from "react"
import { Text } from "react-native"
import { tr } from "../i18n/t"
import { ButtonDeconnect } from "./ButtonDeconnect"
import { ButtonsOkCancel } from "../ui/ButtonsOkCancel"
import { Col } from "../ui/Grid"
import { ModalBox, ModalContent } from "../ui/Modal"
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { logout } from '../actions/auth';
import { CommonStyles } from '../styles/common/styles';
import ConnectionTrackingBar from "../ui/ConnectionTrackingBar";
import { PageContainer } from '../ui/ContainerContent';
import { Me } from "../infra/Me";
import { LightP } from "../ui/Typography";

export class UserProfile extends React.Component<{ logout: (login: string) => Promise<void> }, { showDisconnect: boolean }> {
	public state = {
		showDisconnect: false,
	}

	public disconnect() {
		this.setState({ showDisconnect: false })
		this.props.logout(Me.session.login)
	}

	public disconnectBox = () => (
		<ModalContent>
			<LightP>{tr.Are_you_sure}</LightP>
			<LightP>{tr.to_disconnect}</LightP>
			<ButtonsOkCancel
				onCancel={() => this.setState({ showDisconnect: false })}
				onValid={() => this.disconnect()}
				title={tr.Disconnect}
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
				<ButtonDeconnect onPress={() => this.setState({ showDisconnect: true })} />
			</PageContainer>
		)
	}
}

export default connect(state => ({}), dispatch => ({
	logout: (email: string) => logout(dispatch)(email),
}))(UserProfile)