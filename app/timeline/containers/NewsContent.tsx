import style from "glamorous-native";
import * as React from "react";
import { View, Text, ScrollView } from "react-native";
import I18n from 'react-native-i18n';
import { ResourceTitle } from "../../ui/headers/ResourceTitle";
import { LeftPanel, PageContainer, ArticleContainer, Header, CenterPanel } from "../../ui/ContainerContent";
import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import { Bold, Light, Paragraph } from "../../ui/Typography";
import { DateView } from "../../ui/DateView";
import { Preview } from "../../ui/Preview";
import { Images } from "../../ui/Images";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { TouchCard } from "../../ui/Card";

export class NewsContentHeader extends React.Component<{ navigation?: any }, undefined> {
	render() {
        const { news } = this.props.navigation.state.params;
		return <ResourceTitle title={ news.title } subTitle={ news.resourceName} navigation={ this.props.navigation } />;
	}
}

export class NewsContent extends React.Component<{ navigation?: any, expend?: boolean }, { expend: boolean }> {
    state = { expend: false }

    constructor(props){
        super(props);
        if(this.props.navigation.state.params.expend){
            this.state.expend = true;
        }
    }

    newsContent(){
        const { date, senderId, senderName, resourceName, message, images } = this.props.navigation.state.params.news;
        return (
            <View>
                <Header>
                    <LeftPanel>
                        <SingleAvatar userId={senderId} />
                    </LeftPanel>
                    <CenterPanel>
                        <Bold>
                            {senderName}
                            <Light> { I18n.t('On') } </Light>
                            {resourceName}
                        </Bold>
                        <DateView date={date} short={false} />
                    </CenterPanel>
                </Header>
                { this.state.expend ? <Paragraph>{ message }</Paragraph> : <Preview textContent={ message } onExpend={ () => this.setState({ expend: true }) } /> }
                <Images images={images} />
            </View>
        )
    }

	render() {
		return (
            <PageContainer>
                <ConnectionTrackingBar />
                <ScrollView>
                    <ArticleContainer>
                        <TouchCard onPress={ () => this.setState({ expend: true }) }>
                            { this.newsContent() }
                        </TouchCard>
                    </ArticleContainer>
                </ScrollView>
            </PageContainer>
		)
	}
}