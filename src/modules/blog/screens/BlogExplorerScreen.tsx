/**
 * Blog explorer
 */

import React from "react";
import { NavigationActions, NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { IGlobalState } from "~/AppStore";
import { Text } from "~/framework/components/text";
import { tryAction } from "~/framework/util/redux/actions";
import { AsyncLoadingState } from "~/framework/util/redux/async";
import { LoadingIndicator } from "~/framework/components/loading";
import Explorer from '~/framework/components/explorer';
import theme from "~/app/theme";

import moduleConfig from "../moduleConfig";
import { fetchBlogsAndFoldersAction } from "../actions";
import { getFolderContent, IBlog, IBlogFolder } from "../reducer";
import { Platform, RefreshControl, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { signURISource, transformedSrc } from "~/infra/oauth";
import moment from "moment";
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRight, HeaderRow, HeaderTitle } from "~/framework/components/header";
import I18n from "i18n-js";

// TYPES ==========================================================================================

export interface IBlogExplorerScreen_DataProps {
    blogs?: IBlog[],
    folders?: IBlogFolder[],
    initialLoadingState: AsyncLoadingState
};
export interface IBlogExplorerScreen_EventProps {
    doFetch: () => Promise<[IBlog[], IBlogFolder[]] | undefined>
}
export interface IBlogExplorerScreen_NavigationParams {
    folderId?: string;
}
export type IBlogExplorerScreen_Props = IBlogExplorerScreen_DataProps & IBlogExplorerScreen_EventProps
    & NavigationInjectedProps<IBlogExplorerScreen_NavigationParams>;


// COMPONENT ======================================================================================

const BlogExplorerScreen = (props: IBlogExplorerScreen_Props) => {
    const insets = useSafeAreaInsets();
    const render = [] as React.ReactNode[];

    // LOADER =====================================================================================

    const [loadingState, setLoadingState] = React.useState(props.initialLoadingState);
    // console.log("loadingState", loadingState);

    React.useEffect(() => {
        // console.log("user effect ?", loadingState);
        if (loadingState === AsyncLoadingState.PRISTINE) {
            setLoadingState(AsyncLoadingState.INIT);
            // console.log("call doFetch()");
            props.doFetch().then(() => setLoadingState(AsyncLoadingState.IDLE));
        }
    }, []);

    const doRefresh = () => {
        setLoadingState(AsyncLoadingState.REFRESH);
        props.doFetch().then(() => setLoadingState(AsyncLoadingState.IDLE));
    };

    // HEADER =====================================================================================

    render.push(<FakeHeader>
        <HeaderRow>
            <HeaderLeft>
                <HeaderAction
                    iconName={Platform.OS === 'ios' ? 'chevron-left1' : 'back'}
                    iconSize={24}
                    onPress={() => props.navigation.dispatch(NavigationActions.back())}
                />
            </HeaderLeft>
            <HeaderCenter>
                <HeaderTitle>{I18n.t('blog.appName')}</HeaderTitle>
            </HeaderCenter>
        </HeaderRow>
    </FakeHeader>);

    // RENDER =====================================================================================

    switch (loadingState) {
        case AsyncLoadingState.IDLE:
        case AsyncLoadingState.REFRESH:
            // console.log("props.folders", props.folders);
            // console.log("props.blogs", props.blogs);
            const { blogs, folders } = getFolderContent(props.blogs!, props.folders!, props.navigation.getParam('folderId'))
            // console.log("folders", folders);
            // console.log("blogs", blogs);
            render.push(<>
                <Text>folderId: {props.navigation.getParam('folderId')}</Text>
                <Explorer
                    folders={folders.map(f => ({ ...f, color: theme.themeOpenEnt.indigo }))}
                    resources={blogs.map(b => ({
                        ...b,
                        color: theme.themeOpenEnt.indigo,
                        date: moment.max(
                            b.fetchPosts?.[0]?.firstPublishDate ?? b.fetchPosts?.[0]?.modified ?? b.fetchPosts?.[0]?.created ?? b.modified ?? b.created,
                            b.modified ?? b.created
                        ),
                        icon: !b.thumbnail && 'bullhorn',
                        thumbnail: b.thumbnail && signURISource(transformedSrc(b.thumbnail))
                    })).sort((a, b) => b.date.valueOf() - a.date.valueOf())}
                    onItemPress={item => { console.log("item pressed", item) }}
                    ListFooterComponent={<View style={{ marginBottom: insets.bottom }} />}
                    refreshControl={<RefreshControl refreshing={loadingState === AsyncLoadingState.REFRESH} onRefresh={() => doRefresh()} />}
                />
            </>);
            break;
        default:
            render.push(<LoadingIndicator />);
    }
    return render;
}

// MAPPING ========================================================================================

export default connect(
    (gs: IGlobalState) => {
        // console.log("CONNECT", gs);
        const bs = moduleConfig.getState(gs);
        // console.log("bs", bs);
        return {
            blogs: bs.blogs.data,
            folders: bs.folders.data,
            initialLoadingState: bs.folders.isPristine && bs.blogs.isPristine
                ? AsyncLoadingState.PRISTINE : AsyncLoadingState.IDLE
        }
    },
    dispatch => bindActionCreators({
        doFetch: tryAction(fetchBlogsAndFoldersAction) as any, // FUCK OFF REACT-REDUX YOUR TYPES DEFINITIONS SUCKS
    }, dispatch)
)(BlogExplorerScreen)
