import * as React from "react"
import { StyleSheet, Text, View } from "react-native"
import Modal from "react-native-modal"
import { layoutSize } from "../constants/layoutSize"
import { tr } from "../i18n/t"
import { CommonStyles } from "./styles/common/styles"
import { ButtonDeconnect } from "./ui/ButtonDeconnect"
import { ButtonsOkCancel } from "./ui/ButtonsOkCancel"
import { Col } from "./ui/Col"

const styles = StyleSheet.create({
	modalContent: {
		alignItems: "center",
		alignSelf: "center",
		backgroundColor: "white",
		borderRadius: 4,
		elevation: CommonStyles.elevation,
		justifyContent: "center",
		paddingHorizontal: layoutSize.LAYOUT_20,
		paddingVertical: layoutSize.LAYOUT_32,
		shadowColor: CommonStyles.shadowColor,
		shadowOffset: CommonStyles.shadowOffset,
		shadowOpacity: CommonStyles.shadowOpacity,
		shadowRadius: CommonStyles.shadowRadius,
	},
	modalDisconnect: {
		alignItems: "center",
		flex: 1,
		justifyContent: "center",
	},
	text: {
		fontSize: layoutSize.LAYOUT_14,
	},
})

export interface IProfilUtilisateurProps {
	auth: any
	logout?: (email: string) => void
}

interface IProfilUtilisateurState {
	showDisconnect: boolean
}

export class ProfilUtilisateur extends React.Component<IProfilUtilisateurProps, IProfilUtilisateurState> {
	public state = {
		showDisconnect: false,
	}

	public disconnect() {
		this.setState({ showDisconnect: false })
		this.props.logout(this.props.auth.email)
	}

	public disconnectBox = () => (
		<View style={styles.modalContent}>
			<Text style={styles.text}>Êtes-vous sûr de vouloir</Text>
			<Text style={styles.text}>vous déconnecter ?</Text>
			<ButtonsOkCancel
				onCancel={() => this.setState({ showDisconnect: false })}
				onValid={() => this.disconnect()}
				title={tr.Se_deconnecter}
			/>
		</View>
	)

	public render() {
		return (
			<Col backgroundColor={"#F8F8FA"}>
				<Modal style={styles.modalDisconnect} backdropOpacity={0.5} isVisible={this.state.showDisconnect}>
					{this.disconnectBox()}
				</Modal>
				<ButtonDeconnect onPress={() => this.setState({ showDisconnect: true })} />
			</Col>
		)
	}
}
