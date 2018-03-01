import style from "glamorous-native"
import * as React from "react"
import { View, Text } from "react-native"
import { CommonStyles } from "../styles/common/styles";
import { DateView } from "../ui/DateView"
import { tr } from "../i18n/t"
import { CenterPanel, Content, Header, LeftPanel, ArticleContainer, ArticlePage } from '../ui/ContainerContent';
import { Images } from "../ui/Images"
import { Card, TouchCard } from '../ui/Card';
import { SingleAvatar } from "../ui/avatars/SingleAvatar";
import { Bold, Light, Paragraph, A } from "../ui/Typography";
import { Preview } from "../ui/Preview";
import { Row, Icon } from "../ui";
import { ResourceTitle } from "../ui/headers/ResourceTitle";
import { HeaderIcon } from "../ui/headers/Header";

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
                            <Light> {tr.On} </Light>
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
			<ArticlePage>
                <ArticleContainer>
                    <TouchCard onPress={ () => this.setState({ expend: true }) }>
                        { this.newsContent() }
                    </TouchCard>
                </ArticleContainer>
			</ArticlePage>
		)
	}
}