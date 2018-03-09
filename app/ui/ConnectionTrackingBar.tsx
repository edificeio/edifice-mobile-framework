import style from "glamorous-native"
import * as React from "react"
import { Row } from ".";
import { connect } from "react-redux";
import { watchConnection, checkConnection } from '../actions/connectionTracker';
import { CommonStyles } from '../styles/common/styles';
import { Icon } from './icons/Icon';
import { Animated } from 'react-native';

const TrackerText = style.text({
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
    lineHeight: 40
});

const TrackingContainer = style.view({
    flexDirection: 'row',
    flex: 1
});

const container = {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    elevation: 5
}

export class ConnectionTrackingBar extends React.Component<{ 
    connected: boolean, 
    watch: () => void,
    check: () => Promise<void>,
    loading: boolean
}, { fadeAnim, slideAnim }> {

    state = {
        fadeAnim: new Animated.Value(0),
        slideAnim: new Animated.Value(0)
    };

    visible = false;

    componentDidMount(){
        this.props.watch();
        this.animate();
    }

    animate(){
        if(!this.props.connected){
            Animated.timing(this.state.fadeAnim, {
                toValue: 1,
                duration: 500
            }).start();  

            Animated.timing(this.state.slideAnim, {
                toValue: 40,
                duration: 500
            }).start();

            this.visible = true;
        }

        if(this.props.connected && this.visible){
            this.visible = false;
            setTimeout(() => {
                Animated.timing(this.state.fadeAnim, {
                    toValue: 0,
                    duration: 500
                }).start();  
    
                Animated.timing(this.state.slideAnim, {
                    toValue: 0,
                    duration: 500
                }).start();
            }, 1000);
        }
    }

    componentDidUpdate(){
        this.animate();
    }

    get barColor(): string{
        if(this.props.loading){
            return CommonStyles.warning;
        }
        if(this.props.connected){
            return CommonStyles.success;
        }
        return CommonStyles.error;
    }

	public render() {
        const { fadeAnim, slideAnim } = this.state;
		return (
            <Animated.View style={{ ...container, opacity: fadeAnim, height: slideAnim}}>
                <TrackingContainer style={{ backgroundColor: this.barColor }}>
                    <TrackerText>Connection tracking bar</TrackerText>
                    <Icon name={ "checked" } size={ 18 } style={{ marginRight: 10, marginTop: 10}} color={ "#FFFFFF" }/>
                </TrackingContainer>
            </Animated.View>
		)
	}
}

export default connect(
	(state: any) => ({
        connected: !!state.connectionTracker.connected,
        loading: !!state.connectionTracker.loading
    }),
    (dispatch) => ({
        watch: () => watchConnection(dispatch)(),
        check: () => checkConnection(dispatch)()
    })
)(ConnectionTrackingBar)