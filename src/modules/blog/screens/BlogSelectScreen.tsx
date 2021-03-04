import * as React from "react";
import { View, FlatList, RefreshControl, Linking } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { ThunkDispatch } from "redux-thunk";
import { connect } from "react-redux";
import I18n from "i18n-js";

import moduleConfig from "../moduleConfig";
import withViewTracking from "../../../framework/tracker/withViewTracking";
import { PageView } from "../../../framework/components/page";
import { LoadingIndicator } from "../../../framework/components/loading";
import { FakeHeader, HeaderAction, HeaderCenter, HeaderLeft, HeaderRow, HeaderTitle } from "../../../framework/components/header";
import { TextSemiBold } from "../../../framework/components/text";
import { IGlobalState } from "../../../AppStore";

// TYPES ==========================================================================================

export interface IBlogSelectScreenDataProps {
    // Add data props here
};
export interface IBlogSelectScreenEventProps {
    // Add eventprops here
};
export interface IBlogSelectScreenNavParams {
    // Add nav params here
};
export type IBlogSelectScreenProps = IBlogSelectScreenDataProps
    & IBlogSelectScreenEventProps
    & NavigationInjectedProps<Partial<IBlogSelectScreenNavParams>>;

export enum BlogSelectLoadingState {
    PRISTINE, INIT, REFRESH, DONE
}
export interface IBlogSelectScreenState {
    loadingState: BlogSelectLoadingState;
    // blogs: IBlogPostWithComments | undefined;
    errorState: boolean;
};

// COMPONENT ======================================================================================

export class BlogselectScreen extends React.PureComponent<
    IBlogSelectScreenProps,
    IBlogSelectScreenState
    > {

    // DECLARATIONS =================================================================================

    state: IBlogSelectScreenState = {
        loadingState: BlogSelectLoadingState.PRISTINE,
        // blogPostData: undefined,
        errorState: false,
    }

    // RENDER =======================================================================================

    render() {
        const { loadingState, errorState } = this.state;
        return (
            <>
                {this.renderHeader()}
                <PageView>
                    {[BlogSelectLoadingState.PRISTINE, BlogSelectLoadingState.INIT].includes(loadingState)
                        ? <LoadingIndicator />
                        : errorState
                            ? this.renderError()
                            : this.renderList()
                    }
                </PageView>
            </>
        );
    }

    renderHeader() {
        const { navigation } = this.props;
        // const { blogPostData } = this.state;
        return (
            <FakeHeader>
                <HeaderRow>
                    <HeaderLeft>
                        <HeaderAction iconName="back" onPress={() => navigation.navigate("timeline")} />
                    </HeaderLeft>
                    <HeaderCenter>
                        <HeaderTitle>{I18n.t("blog.blogSelectScreen.title")}</HeaderTitle>
                    </HeaderCenter>
                </HeaderRow>
            </FakeHeader>
        )
    }

    renderError() {
        return <TextSemiBold>{"Error"}</TextSemiBold> // ToDo: great error screen here
    }

    renderList() {
        const { loadingState } = this.state;
        return (
            // <FlatList
            //     data={blogPostComments}
            //     renderItem={({ item }: { item: IBlogPostComment }) => this.renderComment(item)}
            //     keyExtractor={(item: IBlogPostComment) => item.id.toString()}
            //     ListHeaderComponent={this.renderBlogPostDetails()}
            //     contentContainerStyle={{ flexGrow: 1, paddingVertical: 12, backgroundColor: theme.color.background.card }}
            //     refreshControl={
            //         <RefreshControl
            //             refreshing={[BlogPostDetailsLoadingState.REFRESH, BlogPostDetailsLoadingState.INIT].includes(loadingState)}
            //             onRefresh={() => this.doRefresh()}
            //         />
            //     }
            // />
            null
        );
    }

    // LIFECYCLE ====================================================================================

    componentDidMount() {
        this.doInit();
    }

    // METHODS ======================================================================================

    async doInit() {
        try {
            this.setState({ loadingState: BlogSelectLoadingState.INIT });
            await this.doGetBlogList();
        } finally {
            this.setState({ loadingState: BlogSelectLoadingState.DONE });
        }
    }

    async doRefresh() {
        try {
            this.setState({ loadingState: BlogSelectLoadingState.REFRESH });
            await this.doGetBlogList();
        } finally {
            this.setState({ loadingState: BlogSelectLoadingState.DONE });
        }
    }

    async doGetBlogList() {
        try {
            const { navigation } = this.props;
        } catch (e) {
            // ToDo: Error handling
            this.setState({ errorState: true });
            console.warn(`[${moduleConfig.name}] doGetBlogList failed`, e);
        }
    }
}

// UTILS ==========================================================================================

// Add some util functions here

// MAPPING ========================================================================================

const mapStateToProps: (s: IGlobalState) => IBlogSelectScreenDataProps = (s) => ({});

const mapDispatchToProps: (dispatch: ThunkDispatch<any, any, any>, getState: () => IGlobalState) => IBlogSelectScreenEventProps = (dispatch, getState) => ({

})

const BlogSelectScreen_Connected = connect(mapStateToProps, mapDispatchToProps)(BlogselectScreen);
export default withViewTracking("blog/select")(BlogSelectScreen_Connected);
