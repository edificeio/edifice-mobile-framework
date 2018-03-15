import * as React from "react"
import { View } from "react-native";
import { Header, Title, HeaderAction, HeaderIcon } from '../ui/headers/Header';
import I18n from 'react-native-i18n';
import { ListItem, PageContainer } from '../ui/ContainerContent';
import { setFilters, pickFilters } from '../actions/timeline';
import { Bold } from "../ui/Typography";
import { Checkbox } from "../ui/forms/Checkbox";
import { connect } from "react-redux";
import ConnectionTrackingBar from "../ui/ConnectionTrackingBar";

export class FilterHeader extends React.Component<{ navigation: any, pickFilters: (apps) => void, setFilters: (apps) => void, availableApps, selectedApps }, undefined> {
	apply(){
		this.props.setFilters(this.props.selectedApps);
		this.props.navigation.goBack();
	}

	cancel(){
		this.props.pickFilters(this.props.availableApps);
		this.props.navigation.goBack();
	}

	render() {
		return (
            <Header>
                <HeaderIcon name={ "close" } onPress={ () => this.cancel() } />
				<Title>{ I18n.t('timeline-filterBy') }</Title>
				<HeaderAction onPress={ () => this.apply() }>{ I18n.t('apply') }</HeaderAction>
            </Header>
		)
	}
}

export const FilterHeaderConnect = connect(
	(state: any) => ({
		selectedApps: state.timeline.selectedApps,
		availableApps: state.timeline.availableApps
	}),
	dispatch => ({
		pickFilters: (apps) => pickFilters(dispatch)(apps),
		setFilters: (apps) => setFilters(dispatch)(apps)
	})
)(FilterHeader)

export class FilterTimeline extends React.Component<{ selectedApps: any, pickFilters: (selectedApps: any) => void }, any> {
	checkApp(app, val){
		this.props.pickFilters({
			...this.props.selectedApps,
			[app.name]: val,
		});
	}

	checkAllApps(val: boolean){
		let newApps = {};
		for(let prop in this.props.selectedApps){
			newApps[prop] = val;
		}
		this.props.pickFilters(newApps);
	}

	get allAppsChecked(): boolean{
		let allChecked = true;
		for(let app in this.props.selectedApps){
			allChecked = allChecked && this.props.selectedApps[app];
		}
		return allChecked;
	}
	
	render() {
		let apps = [];
		for(let app in this.props.selectedApps){
			apps.push({ 
				name: app, 
				checked: this.props.selectedApps[app] 
			});
		}

		return (
			<PageContainer>
				<ListItem style={{ justifyContent: 'space-between'}} onPress={ () => this.checkAllApps(!this.allAppsChecked) }>
					<Bold>{ I18n.t(`timeline-allFilter`) }</Bold>
					<Checkbox checked={ this.allAppsChecked } onCheck={ () => this.checkAllApps(true) } onUncheck={ () => this.checkAllApps(false) } />
				</ListItem>
				{ apps.map(app => (
					<ListItem key={ app.name } style={{ justifyContent: 'space-between'}} onPress={ () => this.checkApp(app, !app.checked) }>
						<Bold>{ I18n.t(`timeline-${ app.name.toLowerCase() }Filter`) }</Bold>
						<Checkbox checked={ app.checked } onCheck={ () => this.checkApp(app, true) } onUncheck={ () => this.checkApp(app, false) } />
					</ListItem>
				))}
				<ConnectionTrackingBar />
			</PageContainer>
		)
	}
}

export const FilterTimelineConnect = connect(
	(state: any) => ({
		selectedApps: state.timeline.selectedApps
	}),
	dispatch => ({
		pickFilters: (apps) => pickFilters(dispatch)(apps)
	})
)(FilterTimeline)