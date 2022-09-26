import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { BodyBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { LeftColoredItem } from '~/modules/viescolaire/dashboard/components/Item';
import { Homework } from '~/modules/viescolaire/utils/diary';
import { PageContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';

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
    paddingVertical: UI_SIZES.spacing.minor,
    paddingHorizontal: UI_SIZES.spacing.medium,
  },
  homeworksView: {
    marginBottom: UI_SIZES.spacing.large,
  },
  homeworkType: {
    marginTop: UI_SIZES.spacing.medium,
  },
  subtitle: {
    color: theme.palette.grey.stone,
    marginBottom: UI_SIZES.spacing.medium,
  },
  course: {
    textTransform: 'uppercase',
    marginLeft: UI_SIZES.spacing.minor,
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
            <LeftColoredItem shadow style={style.LeftColoredItemInfoBar} color={theme.palette.complementary.orange.regular}>
              {homeworkList && homeworkList[0]?.due_date ? (
                <>
                  <Icon size={20} color={theme.palette.complementary.orange.regular} name="date_range" />
                  <SmallText>&emsp;{moment(homeworkList[0].due_date).format('DD/MM/YY')}</SmallText>
                </>
              ) : null}
              {subject ? <SmallBoldText style={style.course}>{subject}</SmallBoldText> : null}
            </LeftColoredItem>
          </View>

          <View style={style.homeworkPart}>
            <BodyBoldText>{I18n.t('viesco-homework-home')}</BodyBoldText>
            <FlatList
              data={homeworkList}
              renderItem={({ item }) => (
                <View style={style.homeworksView}>
                  {item?.type && <BodyBoldText style={style.homeworkType}>{item?.type}</BodyBoldText>}
                  {item && item?.subject && (
                    <SmallText style={style.subtitle}>
                      {item.subject.charAt(0).toLocaleUpperCase() + item.subject.substring(1).toLocaleLowerCase()} -{' '}
                      {item?.audience}
                    </SmallText>
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
