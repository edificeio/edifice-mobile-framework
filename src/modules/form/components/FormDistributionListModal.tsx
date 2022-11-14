import I18n from 'i18n-js';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import ModalBox from '~/framework/components/ModalBox';
import { UI_SIZES } from '~/framework/components/constants';
import FlatList from '~/framework/components/flatList';
import { Picture } from '~/framework/components/picture';
import { BodyText, SmallText } from '~/framework/components/text';
import { getUserSession } from '~/framework/util/session';
import { DistributionStatus, IDistribution, IForm } from '~/modules/form/reducer';
import { formService } from '~/modules/form/service';

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 32,
  },
  itemIconMargin: {
    marginLeft: UI_SIZES.spacing.minor,
  },
  flatListContainer: {
    marginVertical: UI_SIZES.spacing.medium,
    maxHeight: 300,
  },
});

interface IFormDistributionListModalProps {
  modalBoxRef: any;
  distributions?: IDistribution[];
  form?: IForm;
  openDistribution: (id: number, status: DistributionStatus, form: IForm) => void;
}

export const FormDistributionListModal = ({
  modalBoxRef,
  distributions = [],
  form,
  openDistribution,
}: IFormDistributionListModalProps) => {
  const [isLoading, setLoading] = React.useState(false);
  const data = distributions
    .filter(distribution => distribution.status === DistributionStatus.FINISHED)
    .sort((a, b) => (a.dateResponse! > b.dateResponse! ? 1 : -1));

  const openDistributionCallback = (id: number, status: DistributionStatus) => {
    if (form) {
      openDistribution(id, status, form);
    }
  };

  const renderListItem = (distribution: IDistribution, index: number) => {
    const { dateResponse } = distribution;
    const text = `${index}. ${I18n.t('form.answeredOnDate', { date: dateResponse?.format('DD/MM/YYYY, HH:mm') })}`;
    return (
      <TouchableOpacity
        onPress={() => openDistributionCallback(distribution.id, DistributionStatus.FINISHED)}
        style={styles.itemContainer}>
        <SmallText>{text}</SmallText>
        <Picture
          type="NamedSvg"
          width={20}
          height={20}
          name="ui-eye"
          fill={theme.palette.primary.regular}
          style={styles.itemIconMargin}
        />
      </TouchableOpacity>
    );
  };

  const onAnswerAgain = async () => {
    let distribution =
      distributions.find(d => d.status === DistributionStatus.ONCHANGE) ??
      distributions.find(d => d.status === DistributionStatus.TODO);
    if (!distribution) {
      try {
        setLoading(true);
        const session = getUserSession();
        distribution = await formService.distribution.add(session, distributions[0].id);
        setLoading(false);
      } catch (e) {
        setLoading(false);
        throw e;
      }
    }
    openDistributionCallback(distribution.id, distribution.status);
  };

  return (
    <ModalBox
      ref={modalBoxRef}
      content={
        <View>
          <BodyText>{I18n.t('form.myAnswersTitle', { title: form?.title })}</BodyText>
          <FlatList
            data={data}
            keyExtractor={distribution => distribution.id.toString()}
            renderItem={({ item, index }) => renderListItem(item, index + 1)}
            persistentScrollbar
            bottomInset={false}
            style={styles.flatListContainer}
          />
          <ActionButton text={I18n.t('form.answerAgain')} action={() => onAnswerAgain()} loading={isLoading} />
        </View>
      }
    />
  );
};
