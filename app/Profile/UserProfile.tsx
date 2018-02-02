import * as React from "react"
import { Text } from "react-native"
import { tr } from "../i18n/t"
import { ButtonDeconnect } from "./ButtonDeconnect"
import { ButtonsOkCancel } from "../ui/ButtonsOkCancel"
import { Col } from "../ui/Col"
import { ModalBox, ModalContent } from "../ui/Modal"

export interface IUserProfileProps {
	auth: any
	logout?: (email: string) => void
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
			<Text>Êtes-vous sûr de vouloir</Text>
			<Text>vous déconnecter ?</Text>
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
