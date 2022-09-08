import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { NavigationInjectedProps } from 'react-navigation';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallBoldText, SmallText, TextSizeStyle } from '~/framework/components/text';
import { Session } from '~/modules/viescolaire/utils/cdt';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { viescoTheme } from '~/modules/viescolaire/viesco/utils/viescoTheme';
import { PageContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';

const style = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  sessionPart: {
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  sessionInfoBar: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  LeftColoredItemInfoBar: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  pageTitle: {
    color: theme.palette.grey.stone,
    textTransform: 'uppercase',
  },
  title: {
    ...TextSizeStyle.Medium,
  },
  course: {
    textTransform: 'uppercase',
    marginLeft: UI_SIZES.spacing.minor,
  },
});

type IDisplaySessionProps = {
  session: Session;
  sessionList: Session[];
} & NavigationInjectedProps;

type IDisplaySessionState = {
  indexSelectedSession: number;
  isRemovedDescription: boolean; // this variable is used to reset the description list in the <HtmlContentView /> component when the homeworkList is updated
};

export default class DisplaySession extends React.PureComponent<IDisplaySessionProps, IDisplaySessionState> {
  constructor(props) {
    super(props);

    this.state = {
      indexSelectedSession: 0,
      isRemovedDescription: true,
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
      this.setState({ indexSelectedSession: index, isRemovedDescription: false });
    }
  }

  componentDidUpdate(prevProps) {
    const { sessionList } = this.props;

    if (this.props.sessionList && prevProps.sessionList !== this.props.sessionList) {
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
    const { indexSelectedSession } = this.state;

    if (sessionList !== undefined) {
      if (nativeEvent.state === State.END) {
        if (nativeEvent.translationX < 0 && indexSelectedSession < sessionList.length - 1) {
          this.onSessionChange(indexSelectedSession + 1);
        } else if (nativeEvent.translationX > 0 && indexSelectedSession > 0) {
          this.onSessionChange(indexSelectedSession - 1);
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
          <View style={style.mainView}>
            <View style={style.sessionInfoBar}>
              <LeftColoredItem shadow style={style.LeftColoredItemInfoBar} color={viescoTheme.palette.diary}>
                {sessionList && sessionList[indexSelectedSession]?.date ? (
                  <>
                    <Icon size={20} color={viescoTheme.palette.diary} name="date_range" />
                    <SmallText>&emsp;{moment(sessionList[indexSelectedSession].date).format('DD/MM/YY')}</SmallText>
                  </>
                ) : null}
                {sessionList && sessionList[indexSelectedSession]?.subject ? (
                  <SmallBoldText style={style.course}>{sessionList[indexSelectedSession].subject}</SmallBoldText>
                ) : null}
              </LeftColoredItem>
            </View>

            <ScrollView>
              <View style={style.sessionPart}>
                <SmallText style={style.pageTitle}>{I18n.t('viesco-session')}</SmallText>
                {sessionList && sessionList[indexSelectedSession]?.title && (
                  <SmallBoldText style={style.title}>{sessionList[indexSelectedSession].title}</SmallBoldText>
                )}
                {!isRemovedDescription && sessionList && sessionList[indexSelectedSession]?.description && (
                  <HtmlContentView html={sessionList[indexSelectedSession].description} opts={htmlOpts} />
                )}
              </View>
            </ScrollView>
          </View>
        </PanGestureHandler>
      </PageContainer>
    );
  }
}
