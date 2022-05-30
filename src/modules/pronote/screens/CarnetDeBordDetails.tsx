import I18n from 'i18n-js';
import moment from 'moment';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
import { TextSizeStyle } from '~/framework/components/text';
import { extractTextFromHtml } from '~/framework/util/htmlParser/content';
import { IUserSession, getUserSession } from '~/framework/util/session';
import { splitWords } from '~/framework/util/string';
import { TextBold, TextSemiBold } from '~/ui/Typography';

import { CarnetDeBordSection, ICarnetDeBord } from '../model/carnetDeBord';
import redirect from '../service/redirect';

export interface CarnetDeBordDetailsScreenDataProps {
  session: IUserSession;
}

export interface CarnetDeBordDetailsScreenEventProps {}

export interface CarnetDeBordDetailsScreenNavigationParams {
  type: CarnetDeBordSection;
  data: ICarnetDeBord;
}

export type CarnetDeBordDetailsScreenProps = CarnetDeBordDetailsScreenDataProps &
  CarnetDeBordDetailsScreenEventProps &
  NavigationInjectedProps<CarnetDeBordDetailsScreenNavigationParams>;

function CarnetDeBordDetailsScreen(props: CarnetDeBordDetailsScreenProps) {
  const type = props.navigation.getParam('type');
  const data = props.navigation.getParam('data');
  const pageTitleComponent = React.useMemo(() => {
    const title = type && CarnetDeBordDetailsScreen.pageTiteI18n[type];
    return <HeaderTitleAndSubtitle title={I18n.t(title)} subtitle={I18n.t(`CarnetDeBord`)} />;
  }, [type]);
  const items = React.useMemo(() => {
    const itemArray = CarnetDeBordDetailsScreen.getItems(type, data);
    return itemArray?.map((item, index) => (
      <View
        key={index}
        style={[
          CarnetDeBordDetailsScreen.styles.section,
          index + 1 < itemArray.length ? CarnetDeBordDetailsScreen.styles.sectionWithBorder : {},
        ]}>
        <View style={CarnetDeBordDetailsScreen.styles.sectionLeft}>
          {item.title ? <TextBold numberOfLines={1}>{item.title}</TextBold> : null}
          {item.date ? (
            <TextSemiBold
              style={[
                CarnetDeBordDetailsScreen.styles.textDate,
                item.label || item.description ? CarnetDeBordDetailsScreen.styles.textDateMargin : undefined,
              ]}
              numberOfLines={1}>
              {item.date}
            </TextSemiBold>
          ) : null}
          {item.label ? <TextBold numberOfLines={1}>{item.label}</TextBold> : null}
          {item.description ? <Text numberOfLines={1}>{extractTextFromHtml(item.description)}</Text> : null}
        </View>
        {item.value ? (
          <Text numberOfLines={2} style={CarnetDeBordDetailsScreen.styles.sectionRight}>
            {item.value}
          </Text>
        ) : null}
      </View>
    ));
  }, [type, data]);

  const pageId = React.useMemo(() => {
    switch (type) {
      case CarnetDeBordSection.CAHIER_DE_TEXTES:
        return data.PagePronote?.['Travail à faire à la maison'];
      case CarnetDeBordSection.NOTES:
        return data.PagePronote?.['Mon relevé de notes'];
      case CarnetDeBordSection.COMPETENCES:
        return data.PagePronote?.['Évaluations par compétence'];
      case CarnetDeBordSection.VIE_SCOLAIRE:
        return data.PagePronote?.['Récapitulatif des évènements de la vie scolaire'];
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
          <Text style={CarnetDeBordDetailsScreen.styles.message}>{data.PageReleveDeNotes.Message}</Text>
        ) : null}
        <CardWithoutPadding style={CarnetDeBordDetailsScreen.styles.card}>{items}</CardWithoutPadding>
        <ActionButton
          style={CarnetDeBordDetailsScreen.styles.button}
          type="secondary"
          action={() => {
            redirect(props.session, data.address, pageId);
          }}
          iconName="pictos-external-link"
          text={I18n.t('pronote.carnetDeBord.openInPronote')}
        />
      </ScrollView>
    </PageView>
  );
}
CarnetDeBordDetailsScreen.pageTiteI18n = {
  [CarnetDeBordSection.CAHIER_DE_TEXTES]: 'pronote.carnetDeBord.cahierDeTextes.title',
  [CarnetDeBordSection.NOTES]: 'pronote.carnetDeBord.releveDeNotes.title',
  [CarnetDeBordSection.COMPETENCES]: 'pronote.carnetDeBord.competences.title',
  [CarnetDeBordSection.VIE_SCOLAIRE]: 'pronote.carnetDeBord.vieScolaire.title',
};
CarnetDeBordDetailsScreen.getItems = (type: CarnetDeBordSection, data: ICarnetDeBord) => {
  switch (type) {
    case CarnetDeBordSection.CAHIER_DE_TEXTES: {
      const tafs: { date: string; label?: string; description: string }[] = [];
      if (data.PageCahierDeTextes.CahierDeTextes)
        for (const item of data.PageCahierDeTextes.CahierDeTextes) {
          if (item.TravailAFaire)
            for (const taf of item.TravailAFaire) {
              tafs.push({
                date: I18n.t('pronote.carnetDeBord.cahierDeTextes.PourDate', {
                  date: CarnetDeBordDetailsScreen.formatDatePast(taf.PourLe),
                }),
                label: item.Matiere,
                description: taf.Descriptif || `<p>${I18n.t('pronote.carnetDeBord.noInfo')}</p>`,
              });
            }
        }
      return tafs;
    }
    case CarnetDeBordSection.NOTES: {
      return data.PageReleveDeNotes.Devoir?.map(item => ({
        title: item.Matiere,
        date: CarnetDeBordDetailsScreen.formatDate(item.Date),
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
        date: CarnetDeBordDetailsScreen.formatDate(item.Date),
        value: splitWords(item.NiveauDAcquisition.Libelle, 2),
      }));
    }
    case CarnetDeBordSection.VIE_SCOLAIRE: {
      return data.PageVieScolaire.VieScolaire?.map(item => ({
        label: item.type.toLocaleUpperCase(),
        date:
          item.type === 'Absence'
            ? item.DateDebut.isSame(item.DateFin, 'day')
              ? CarnetDeBordDetailsScreen.formatDate(item.DateDebut)
              : I18n.t('pronote.carnetDeBord.vieScolaire.dateFromTo', {
                  start: CarnetDeBordDetailsScreen.formatDate(item.DateDebut),
                  end: CarnetDeBordDetailsScreen.formatDate(item.DateFin),
                })
            : CarnetDeBordDetailsScreen.formatDate(item.Date),
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
CarnetDeBordDetailsScreen.formatDate = (m: moment.Moment) =>
  m.calendar(null, {
    sameDay: `[${I18n.t('common.date.today')}]`,
    nextDay: `[${I18n.t('common.date.tomorrow')}]`,
    nextWeek: 'dddd',
    lastDay: `[${I18n.t('common.date.yesterday')}]`,
    sameElse: 'DD MMM',
  });
CarnetDeBordDetailsScreen.formatDatePast = (m: moment.Moment) =>
  m.calendar(null, {
    sameDay: `[${I18n.t('common.date.today')}]`,
    nextDay: `[${I18n.t('common.date.tomorrow')}]`,
    nextWeek: 'dddd',
    lastDay: `[${I18n.t('common.date.yesterday')}]`,
    sameElse: 'ddd DD MMM',
  });
CarnetDeBordDetailsScreen.styles = StyleSheet.create({
  card: {
    marginHorizontal: UI_SIZES.spacing.large,
    marginTop: UI_SIZES.spacing.large,
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
    marginLeft: UI_SIZES.spacing.medium,
  },
  sectionWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.palette.grey.cloudy,
  },
  textDate: {
    color: theme.palette.grey.graphite,
    ...TextSizeStyle.Small,
  },
  textDateMargin: {
    marginBottom: UI_SIZES.spacing.extraSmall,
  },
  button: {
    marginTop: UI_SIZES.spacing.extraLargePlus,
    marginBottom: UI_SIZES.screen.bottomInset
      ? UI_SIZES.spacing.extraLargePlus + UI_SIZES.spacing.extraLarge - UI_SIZES.screen.bottomInset
      : UI_SIZES.spacing.extraLargePlus + UI_SIZES.spacing.large,
  },
  message: {
    marginHorizontal: UI_SIZES.spacing.large,
    marginTop: UI_SIZES.spacing.extraLarge,
    marginBottom: UI_SIZES.spacing.extraLarge - UI_SIZES.spacing.large,
  },
});

export default connect(
  (state: IGlobalState) => ({
    session: getUserSession(),
  }),
  (dispatch: ThunkDispatch<any, any, any>) => bindActionCreators({}, dispatch),
)(CarnetDeBordDetailsScreen);
