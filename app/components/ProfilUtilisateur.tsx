import * as React from "react"
import Modal from "react-native-modal";
import { StyleSheet, Text, View } from 'react-native';
import {ViewButtons} from "./ui/ViewButtons";
import {ButtonDeconnect} from "./ui/ButtonDeconnect";
import {Col} from "./ui/Col";
import {layoutSize} from "../constants/layoutSize";

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: 'white',
        paddingHorizontal: layoutSize.LAYOUT_20,
        paddingVertical: layoutSize.LAYOUT_32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    text: {
        color: "#414355",
    },
    modalDisconnect: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});

export interface ProfilUtilisateurProps {
    auth: any,
    logout?: (string) => void
}

interface ProfilUtilisateurState {
    showDisconnect: boolean
}

export class ProfilUtilisateur extends React.Component<ProfilUtilisateurProps, ProfilUtilisateurState> {
    state = {
        showDisconnect: false,
    };

    disconnect() {
        this.setState( {showDisconnect: false})
        this.props.logout(this.props.auth.email)
    }

    disconnectBox = () => (
        <View style={styles.modalContent}>
            <Text style={styles.text}>Êtes-vous sûr de vouloir</Text>
            <Text style={styles.text}>vous déconnecter ?</Text>
            <ViewButtons onCancel={() => this.setState( {showDisconnect: false})} onValid={() => this.disconnect()} title={"Se déconnecter"}/>
        </View>
    );

	public render() {
		return (
			<Col backgroundColor={"#F8F8FA"}>
                <Modal style={styles.modalDisconnect} backdropOpacity={0.5} isVisible={this.state.showDisconnect}>{this.disconnectBox()}</Modal>
				<ButtonDeconnect onPress={() => this.setState( {showDisconnect: true})}/>
			</Col>
    	)

	}
}
