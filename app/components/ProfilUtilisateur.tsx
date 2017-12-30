import * as React from "react"
import Modal from "react-native-modal";
import { StyleSheet, Text, View } from 'react-native';
import {ViewButtons} from "./ui/ViewButtons";
import {ButtonDeconnect} from "./ui/ButtonDeconnect";
import {Col} from "./ui/Col";

const styles = StyleSheet.create({
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
});

export interface ProfilUtilisateurProps {
    logout?: () => void
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
        this.props.logout()
    }

    disconnectBox = () => (
        <View style={styles.modalContent}>
            <View>
                <Text>Etes vous sur de vouloir</Text>
                <Text>vous déconnecter?</Text>
            </View>
            <ViewButtons onCancel={() => this.setState( {showDisconnect: false})} onValid={() => this.disconnect()} title={"Se déconnecter"}/>
        </View>
    );

	public render() {
		return (
			<Col>
                <Modal isVisible={this.state.showDisconnect}>{this.disconnectBox()}</Modal>
				<ButtonDeconnect onPress={() => this.setState( {showDisconnect: true})}/>
			</Col>
    	)

	}
}
