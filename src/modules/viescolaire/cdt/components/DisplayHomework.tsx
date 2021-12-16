import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

import { homework } from '../../utils/cdt';

import { Text, TextBold } from '~/framework/components/text';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { INavigationProps } from '~/types';
import { Icon } from '~/ui';
import { PageContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';

const style = StyleSheet.create({
  homeworkPart: {
    paddingVertical: 8,
    paddingHorizontal: 15,
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

type IDisplayHomeworkProps = {
  homework: homework;
  homeworkList: homework[];
} & INavigationProps;

type IDisplayHomeworkState = {
  indexSelectedHomework: number;
  isRemovedDescription: boolean;
};

export default class DisplayHomework extends React.PureComponent<IDisplayHomeworkProps, IDisplayHomeworkState> {
  constructor(props) {
    super(props);

    this.state = {
      indexSelectedHomework: 0,
      isRemovedDescription: false,
    };
  }

  componentDidMount() {
    const { homeworkList } = this.props;

    if (this.props.homeworkList) {
      const index = homeworkList.findIndex(item =>
        this.state.indexSelectedHomework
          ? item.id === homeworkList[this.state.indexSelectedHomework].id
          : item.id === this.props.homework.id,
      );
      this.setState({ indexSelectedHomework: index });
    }
  }

  componentDidUpdate(prevprops) {
    const { homeworkList } = this.props;

    if (this.props.homeworkList && prevprops.homeworkList !== this.props.homeworkList) {
      const index = homeworkList.findIndex(item =>
        this.state.indexSelectedHomework
          ? item.id === homeworkList[this.state.indexSelectedHomework].id
          : item.id === this.props.homework.id,
      );
      this.setState({ indexSelectedHomework: index });
    } else if (this.state.isRemovedDescription) {
      this.setState({ isRemovedDescription: false });
    }
  }

  public onHomeworkChange = (selectedIndex: number) => {
    this.setState({ indexSelectedHomework: selectedIndex, isRemovedDescription: true });
  };

  public handleStateChange = ({ nativeEvent }) => {
    const { homeworkList } = this.props;

    if (homeworkList !== undefined) {
      if (nativeEvent.state === State.END) {
        const index = homeworkList.findIndex(item =>
          this.state.indexSelectedHomework
            ? item.id === homeworkList[this.state.indexSelectedHomework].id
            : item.id === this.props.homework.id,
        );

        if (nativeEvent.translationX < 0 && index < homeworkList.length - 1) {
          this.onHomeworkChange(index + 1);
        } else if (nativeEvent.translationX > 0 && index > 0) {
          this.onHomeworkChange(index - 1);
        }
      }
    }
  };

  public render() {
    const { homeworkList } = this.props;
    const { indexSelectedHomework, isRemovedDescription } = this.state;
    const htmlOpts = {
      selectable: true,
    };

    return (
      <PageContainer>
        <PanGestureHandler onHandlerStateChange={this.handleStateChange}>
          <View style={{ flex: 1 }}>
            <View style={{ justifyContent: 'flex-end', flexDirection: 'row' }}>
              <LeftColoredItem shadow style={{ alignItems: 'flex-end', flexDirection: 'row' }} color="#FA9700">
                {homeworkList && homeworkList[indexSelectedHomework]?.description ? (
                  <>
                    <Icon size={20} color="#FA9700" name="date_range" />
                    <Text>&emsp;{moment(homeworkList[indexSelectedHomework].created_date).format('DD/MM/YY')}</Text>
                    <Text style={style.course}>&emsp;{homeworkList[indexSelectedHomework].subject}</Text>
                  </>
                ) : null}
              </LeftColoredItem>
            </View>

            <ScrollView>
              <View style={[style.homeworkPart]}>
                <TextBold style={style.title}>{I18n.t('viesco-homework-home')}</TextBold>
                {homeworkList && homeworkList[indexSelectedHomework]?.due_date && (
                  <Text style={style.subtitle}>
                    {I18n.t('viesco-homework-fordate')}{' '}
                    {moment(homeworkList[indexSelectedHomework].due_date).format('Do MMMM YYYY')}
                  </Text>
                )}
                {!isRemovedDescription && homeworkList && homeworkList[indexSelectedHomework]?.description && (
                  <HtmlContentView html={homeworkList[indexSelectedHomework].description} opts={htmlOpts} />
                )}
              </View>
            </ScrollView>
          </View>
        </PanGestureHandler>
      </PageContainer>
    );
  }
}
