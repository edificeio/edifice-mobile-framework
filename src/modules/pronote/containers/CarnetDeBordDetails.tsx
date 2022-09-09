import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import theme from '~/app/theme';
import { ActionButton } from '~/framework/components/ActionButton';
import { CardWithoutPadding, cardPadding } from '~/framework/components/card';
import { UI_SIZES } from '~/framework/components/constants';
import { HeaderTitleAndSubtitle } from '~/framework/components/header';
import { PageView } from '~/framework/components/page';
import ScrollView from '~/framework/components/scrollView';
import { CaptionBoldText, SmallBoldText } from '~/framework/components/text';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';
import { splitWords } from '~/framework/util/string';
import { CarnetDeBordSection, ICarnetDeBord } from '~/modules/pronote/state/carnetDeBord';

export interface CarnetDeBordDetailsDataProps {}

export interface CarnetDeBordDetailsEventProps {}

export interface CarnetDeBordDetailsNavigationParams {
  type: CarnetDeBordSection;
  data: ICarnetDeBord;
}

export type CarnetDeBordDetailsProps = CarnetDeBordDetailsDataProps &
  CarnetDeBordDetailsEventProps &
  NavigationInjectedProps<CarnetDeBordDetailsNavigationParams>;

function CarnetDeBordDetails(props: CarnetDeBordDetailsProps) {
  const type = props.navigation.getParam('type');
  const data = props.navigation.getParam('data');
  const pageTitleComponent = React.useMemo(() => {
    const title = type && CarnetDeBordDetails.pageTiteI18n[type];
    return <HeaderTitleAndSubtitle title={I18n.t(title)} subtitle={I18n.t(`CarnetDeBord`)} />;
  }, [type]);
  const items = React.useMemo(() => {
    const itemArray = CarnetDeBordDetails.getItems(type, data);
    return itemArray?.map((item, index) => (
      <View
        key={index}
        style={[
          CarnetDeBordDetails.styles.section,
          index + 1 < itemArray.length ? CarnetDeBordDetails.styles.sectionWithBorder : {},
        ]}>
        <View style={CarnetDeBordDetails.styles.sectionLeft}>
          {item.title ? <SmallBoldText numberOfLines={1}>{item.title}</SmallBoldText> : null}
          {item.date ? (
            <CaptionBoldText
              style={[
                CarnetDeBordDetails.styles.textDate,
                item.label || item.description ? CarnetDeBordDetails.styles.textDateMargin : undefined,
              ]}
              numberOfLines={1}>
              {item.date}
            </CaptionBoldText>
          ) : null}
          {item.label ? <SmallBoldText numberOfLines={1}>{item.label}</SmallBoldText> : null}
          {item.description ? <Small numberOfLines={1}>{extractTextFromHtml(item.description)}</Small> : null}
        </View>
        {item.value ? (
          <Small numberOfLines={2} style={CarnetDeBordDetails.styles.sectionRight}>
            {item.value}
          </Small>
        ) : null}
      </View>
    ));
  }, [type, data]);

  const externalLink = React.useMemo(() => {
    switch (type) {
      case CarnetDeBordSection.CAHIER_DE_TEXTES:
        return `${data.address}?page=${data.PagePronote?.['Travail à faire à la maison'] ?? ''}`;
      case CarnetDeBordSection.NOTES:
        return `${data.address}?page=${data.PagePronote?.['Mon relevé de notes'] ?? ''}`;
      case CarnetDeBordSection.COMPETENCES:
        return `${data.address}?page=${data.PagePronote?.['Évaluations par compétence'] ?? ''}`;
      case CarnetDeBordSection.VIE_SCOLAIRE:
        return `${data.address}?page=${data.PagePronote?.['Récapitulatif des évènements de la vie scolaire'] ?? ''}`;
    }
  }, [data, type]);

  return (
    <PageView
      navigation={props.navigation}
      navBarWithBack={{
        title: pageTitleComponent,
      }}>
      <ScrollView alwaysBounceVertical={false}>
        {type === CarnetDeBordSection.NOTES && data.PageReleveDeNotes.Message ? (
          <Small style={CarnetDeBordDetails.styles.message}>{data.PageReleveDeNotes.Message}</Small>
        ) : null}
        <CardWithoutPadding style={CarnetDeBordDetails.styles.card}>{items}</CardWithoutPadding>
        <ActionButton
          style={CarnetDeBordDetails.styles.button}
          type="secondary"
          url={externalLink}
          text={I18n.t('pronote.carnetDeBord.openInPronote')}
        />
      </ScrollView>
    </PageView>
  );
}
CarnetDeBordDetails.pageTiteI18n = {
  [CarnetDeBordSection.CAHIER_DE_TEXTES]: 'pronote.carnetDeBord.cahierDeTextes.title',
  [CarnetDeBordSection.NOTES]: 'pronote.carnetDeBord.releveDeNotes.title',
  [CarnetDeBordSection.COMPETENCES]: 'pronote.carnetDeBord.competences.title',
  [CarnetDeBordSection.VIE_SCOLAIRE]: 'pronote.carnetDeBord.vieScolaire.title',
};
CarnetDeBordDetails.getItems = (type: CarnetDeBordSection, data: ICarnetDeBord) => {
  switch (type) {
    case CarnetDeBordSection.CAHIER_DE_TEXTES: {
      const tafs: object[] = [];
      if (data.PageCahierDeTextes.CahierDeTextes)
        for (const item of data.PageCahierDeTextes.CahierDeTextes) {
          if (item.TravailAFaire)
            for (const taf of item.TravailAFaire) {
              tafs.push({
                date: I18n.t('pronote.carnetDeBord.cahierDeTextes.PourDate', {
                  date: CarnetDeBordDetails.formatDatePast(taf.PourLe),
                }),
                lavel: item.Matiere,
                description: taf.Descriptif || `<p>${I18n.t('pronote.carnetDeBord.noInfo')}</p>`,
              });
            }
        }
      return tafs;
    }
    case CarnetDeBordSection.NOTES: {
      return data.PageReleveDeNotes.Devoir?.map(item => ({
        title: item.Matiere,
        date: CarnetDeBordDetails.formatDate(item.Date),
        value: item.Bareme
          ? I18n.t('pronote.carnetDeBord.releveDeNotes.note', {
              note: item.Note,
              bareme: item.Bareme,
            })
          : item.Note,
      }));
    }
    case CarnetDeBordSection.COMPETENCES: {
      return data.PageCompetences.Competences?.map(item => ({
        title: item.Matiere,
        date: CarnetDeBordDetails.formatDate(item.Date),
        value: splitWords(item.NiveauDAcquisition.Libelle, 2),
      }));
    }
    case CarnetDeBordSection.VIE_SCOLAIRE: {
      return data.PageVieScolaire.VieScolaire?.map(item => ({
        label: item.type.toLocaleUpperCase(),
        date:
          item.type === 'Absence'
            ? item.DateDebut.isSame(item.DateFin, 'day')
              ? CarnetDeBordDetails.formatDate(item.DateDebut)
              : I18n.t('pronote.carnetDeBord.vieScolaire.dateFromTo', {
                  start: CarnetDeBordDetails.formatDate(item.DateDebut),
                  end: CarnetDeBordDetails.formatDate(item.DateFin),
                })
            : CarnetDeBordDetails.formatDate(item.Date),
        description:
          item.type === 'Absence' || item.type === 'Retard'
            ? item.Motif
            : item.type === 'Punition' || item.type === 'Sanction'
            ? item.Nature
            : item.type === 'Observation'
            ? item.Observation
            : I18n.t('pronote.carnetDeBord.noInfo'),
      }));
    }
  }
};
CarnetDeBordDetails.formatDate = (m: moment.Moment) =>
  m.calendar(null, {
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastDay: '[Yesterday]',
    lastWeek: '[Last] dddd',
    sameElse: 'DD MMM',
  });
CarnetDeBordDetails.formatDatePast = (m: moment.Moment) =>
  m.calendar(null, {
    sameDay: '[Today]',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastDay: '[Yesterday]',
    lastWeek: '[Last] dddd',
    sameElse: 'ddd DD MMM',
  });
CarnetDeBordDetails.styles = StyleSheet.create({
  card: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginVertical: UI_SIZES.spacing.medium,
  },
  section: {
    ...cardPadding,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLeft: {
    flex: 1,
  },
  sectionRight: {
    flex: 0,
    textAlign: 'right',
    marginLeft: UI_SIZES.spacing.small,
  },
  sectionWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.cloudy,
  },
  textDate: {
    color: theme.palette.grey.graphite,
  },
  textDateMargin: {
    marginBottom: UI_SIZES.spacing.tiny,
  },
  button: {
    marginTop: UI_SIZES.spacing.big,
  },
  message: {
    marginHorizontal: UI_SIZES.spacing.medium,
    marginTop: UI_SIZES.spacing.big,
    marginBottom: UI_SIZES.spacing.big - UI_SIZES.spacing.medium,
  },
});

export default connect(
  (state: IGlobalState) => ({}),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(CarnetDeBordDetails);
