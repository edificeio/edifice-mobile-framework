import * as React from "react";
import {connect} from "react-redux";
import config from "../config";
import {bindActionCreators} from "redux";
import {NavigationScreenProp} from "react-navigation";
import {standardNavScreenOptions} from "../../navigation/helpers/navScreenOptions";
import {HeaderAction} from "../../ui/headers/NewHeader";
import {FlatList, View, ViewStyle} from "react-native";
import {IEntity, IProps} from "../types/entity";
import {Entity} from "../components";
import {fetchWorkspaceList} from "../actions/list";
import {Loading} from "../../ui";


const HeaderBackAction = ({navigation, style}: {
    navigation: NavigationScreenProp<{}>, style?: ViewStyle
}) => {
    const filter = navigation.getParam("filter")
    const parentId = navigation.getParam("backId")

    return (
        <HeaderAction
            onPress={() => navigation.navigate({routeName: "Workspace", params: {filter, parentId}, key: Math.random().toString()})}
            name={"back"} style={style}/>
    )
}



export class List extends React.PureComponent<IProps, {}> {
    static navigationOptions = ({navigation}: { navigation: NavigationScreenProp<{}> }) => {
        return standardNavScreenOptions(
            {
                title: "Workspace",
                headerLeft: <HeaderBackAction navigation={navigation}/>,
            },
            navigation
        );
    };

    public componentDidMount() {
        this.props.fetchWorkspaceList(
            {
                filter: this.props.navigation.getParam("filter"),
                parentId: this.props.navigation.getParam("parentId")
            });
    }

    public onPress(parentId: string) {
        const filter = this.props.navigation.getParam("filter")
        const backId = this.props.navigation.getParam("parentId")

        this.props.navigation.navigate({routeName: "Workspace", params: {backId, filter, parentId}, key: parentId})
    }

    public render() {
        const {filesFolders, isFetching} = this.props

        if (isFetching)
            return <Loading/>;

        return (
            <View>
                <FlatList
                    data={Object.values(filesFolders)}
                    keyExtractor={(item: IEntity) => item.id}
                    renderItem={({item}) => <Entity {...item} onPress={this.onPress.bind(this)}/>}
                />
            </View>
        )
    }
}

const mapStateToProps = (state: any) => {
    const filesFolders = config.getLocalState(state).filesFolders.data;
    const {isFetching} = config.getLocalState(state).filesFolders;
    return {filesFolders, isFetching};
};

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({fetchWorkspaceList}, dispatch);
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(List);
