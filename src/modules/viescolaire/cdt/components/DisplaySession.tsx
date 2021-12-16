import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, ScrollView, State } from 'react-native-gesture-handler';

import { session } from '../../utils/cdt';

import { Text, TextBold } from '~/framework/components/text';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { INavigationProps } from '~/types';
import { Icon } from '~/ui';
import { PageContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';

const style = StyleSheet.create({
  sessionPart: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  pageTitle: {
    color: '#AFAFAF',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
  },
  subtitle: {
    color: '#AFAFAF',
    marginBottom: 15,
  },
  course: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

type IDisplaySessionProps = {
  session: session;
  sessionList: session[];
} & INavigationProps;

type IDisplaySessionState = {
  indexSelectedSession: number;
  isRemovedDescription: boolean;
};

export default class DisplaySession extends React.PureComponent<IDisplaySessionProps, IDisplaySessionState> {
  constructor(props) {
    super(props);

    this.state = {
      indexSelectedSession: 0,
      isRemovedDescription: false,
    };
  }

  componentDidMount() {
    const { sessionList } = this.props;

    if (this.props.sessionList) {
      const index = sessionList.findIndex(item =>
        this.state.indexSelectedSession
          ? item.id === sessionList[this.state.indexSelectedSession].id
          : item.id === this.props.session.id,
      );
      this.setState({ indexSelectedSession: index });
    }
  }

  componentDidUpdate(prevprops) {
    const { sessionList } = this.props;

    if (this.props.sessionList && prevprops.sessionList !== this.props.sessionList) {
      const index = sessionList.findIndex(item =>
        this.state.indexSelectedSession
          ? item.id === sessionList[this.state.indexSelectedSession].id
          : item.id === this.props.session.id,
      );
      this.setState({ indexSelectedSession: index });
    } else if (this.state.isRemovedDescription) {
      this.setState({ isRemovedDescription: false });
    }
  }

  public onSessionChange = (selectedIndex: number) => {
    this.setState({ indexSelectedSession: selectedIndex, isRemovedDescription: true });
  };

  public handleStateChange = ({ nativeEvent }) => {
    const { sessionList } = this.props;

    if (sessionList !== undefined) {
      if (nativeEvent.state === State.END) {
        const index = sessionList.findIndex(item =>
          this.state.indexSelectedSession
            ? item.id === sessionList[this.state.indexSelectedSession].id
            : item.id === this.props.session.id,
        );

        if (nativeEvent.translationX < 0 && index < sessionList.length - 1) {
          this.onSessionChange(index + 1);
        } else if (nativeEvent.translationX > 0 && index > 0) {
          this.onSessionChange(index - 1);
        }
      }
    }
  };

  public render() {
    const { sessionList } = this.props;
    const { indexSelectedSession, isRemovedDescription } = this.state;
    const htmlOpts = {
      selectable: true,
    };

    return (
      <PageContainer>
        <PanGestureHandler onHandlerStateChange={this.handleStateChange}>
          <View style={{ flex: 1 }}>
            <View style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>
              <LeftColoredItem shadow style={{ alignItems: 'flex-end', flexDirection: 'row' }} color="#00ab6f">
                <Icon size={20} color="#00ab6f" name="date_range" />
                <Text>&emsp;{sessionList && moment(sessionList[indexSelectedSession]?.date).format('DD/MM/YY')}</Text>
                <Text style={style.course}>&emsp;{sessionList && sessionList[indexSelectedSession]?.subject}</Text>
              </LeftColoredItem>
            </View>

            <ScrollView>
              <View style={[style.sessionPart]}>
                <Text style={style.pageTitle}>{I18n.t('viesco-session')}</Text>
                {sessionList && <TextBold style={style.title}>{sessionList[indexSelectedSession]?.title}</TextBold>}
                {!isRemovedDescription && sessionList && sessionList[indexSelectedSession]?.description && (
                  <HtmlContentView html={sessionList[indexSelectedSession]?.description} opts={htmlOpts} />
                )}
              </View>
            </ScrollView>
          </View>
        </PanGestureHandler>
      </PageContainer>
    );
  }
}
