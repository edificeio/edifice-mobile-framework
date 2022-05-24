import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';

import { Text, TextBold } from '~/framework/components/text';
import { Homework } from '~/modules/viescolaire/utils/cdt';
import { LeftColoredItem } from '~/modules/viescolaire/viesco/components/Item';
import { PageContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';
import { Icon } from '~/ui/icons/Icon';

const style = StyleSheet.create({
  mainView: {
    flex: 1,
  },
  homeworksInfoBar: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  LeftColoredItemInfoBar: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  homeworkPart: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 18,
  },
  homeworksView: {
    marginBottom: 40,
  },
  homeworkType: {
    marginTop: 15,
    fontWeight: 'bold',
    fontSize: 16,
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

type IDisplayListHomeworkProps = {
  subject: string;
  homeworkList: Homework[];
};

export default class DisplayListHomework extends React.PureComponent<IDisplayListHomeworkProps> {
  public render() {
    const { subject, homeworkList } = this.props;
    const htmlOpts = {
      selectable: true,
    };

    return (
      <PageContainer>
        <View style={style.mainView}>
          <View style={style.homeworksInfoBar}>
            <LeftColoredItem shadow style={style.LeftColoredItemInfoBar} color="#FA9700">
              {homeworkList && homeworkList[0]?.due_date ? (
                <>
                  <Icon size={20} color="#FA9700" name="date_range" />
                  <Text>&emsp;{moment(homeworkList[0].due_date).format('DD/MM/YY')}</Text>
                </>
              ) : null}
              {subject ? <Text style={style.course}>&emsp;{subject}</Text> : null}
            </LeftColoredItem>
          </View>

          <View style={style.homeworkPart}>
            <TextBold style={style.title}>{I18n.t('viesco-homework-home')}</TextBold>
            <FlatList
              data={homeworkList}
              renderItem={({ item }) => (
                <View style={style.homeworksView}>
                  {item?.type && <Text style={style.homeworkType}>{item?.type}</Text>}
                  {item && item?.subject && (
                    <Text style={style.subtitle}>
                      {item.subject.charAt(0).toLocaleUpperCase() + item.subject.substring(1).toLocaleLowerCase()} -{' '}
                      {item?.audience}
                    </Text>
                  )}
                  {this.props.homeworkList && item?.description && <HtmlContentView html={item.description} opts={htmlOpts} />}
                </View>
              )}
            />
          </View>
        </View>
      </PageContainer>
    );
  }
}
