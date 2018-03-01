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

export interface IUserProfileProps {
	auth: any
	logout: (email: string) => void
}

interface IUserProfileState {
	showDisconnect: boolean
}

export class UserProfile extends React.Component<IUserProfileProps, IUserProfileState> {
	public state = {
		showDisconnect: false,
	}

	public disconnect() {
		this.setState({ showDisconnect: false })
		this.props.logout(this.props.auth.email)
	}

	public disconnectBox = () => (
		<ModalContent>
			<Text>{tr.Are_you_sure}</Text>
			<Text>{tr.to_disconnect}</Text>
			<ButtonsOkCancel
				onCancel={() => this.setState({ showDisconnect: false })}
				onValid={() => this.disconnect()}
				title={tr.Disconnect}
			/>
		</ModalContent>
	)

	public render() {
		return (
			<Col backgroundColor={"#F8F8FA"}>
				<ModalBox backdropOpacity={0.5} isVisible={this.state.showDisconnect}>
					{this.disconnectBox()}
				</ModalBox>
				<ButtonDeconnect onPress={() => this.setState({ showDisconnect: true })} />
			</Col>
		)
	}
}

const mapStateToProps = state => ({
	auth: state.auth,
})

const dispatchAndMapActions = dispatch => bindActionCreators({ logout }, dispatch)

export default connect<{}, {}, IUserProfileProps>(mapStateToProps, dispatch => ({
	logout: (email: string) => logout(dispatch)(email),
}))(UserProfile)