import style from "glamorous-native"
import * as React from "react"
import { Row } from ".";
import { connect } from "react-redux";
import { watchConnection } from '../actions/connectionTracker';

const TrackerText = style.text({
    color: '#FFFFFF'
})

export class ConnectionTrackingBar extends React.Component<{ connected: boolean, watch: () => void }, undefined> {

    componentDidMount(){
        this.props.watch();
    }

	public render() {
		return (
			<Row style={{ backgroundColor: this.props.connected ? 'green' : 'red' }}>
                <TrackerText>Connection tracking bar</TrackerText>
			</Row>
		)
	}
}

export default connect(
	(state: any) => ({
		connected: !!state.connectionTracker.connected
    }),
    (dispatch) => ({
        watch: () => watchConnection(dispatch)()
    })
)(ConnectionTrackingBar)