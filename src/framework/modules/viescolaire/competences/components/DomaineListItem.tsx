import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { SmallText } from '~/framework/components/text';
import { ICompetence, IDomaine, ILevel } from '~/framework/modules/viescolaire/competences/model';
import { ArticleContainer } from '~/ui/ContainerContent';

const styles = StyleSheet.create({
  competenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelColorContainer: {
    marginLeft: UI_SIZES.spacing.small,
    height: 25,
    width: 25,
    borderRadius: UI_SIZES.spacing.medium,
  },
});

interface IDomaineListItemProps {
  competences: ICompetence[];
  domaine: IDomaine;
  levels: ILevel[];
}

export class DomaineListItem extends React.PureComponent<IDomaineListItemProps> {
  getLevelColor(evaluation: number) {
    const levels = this.props.levels.filter(level => level.cycle === 'Cycle 3');

    if (evaluation >= 0 && evaluation < levels.length) {
      return levels[evaluation].couleur ?? levels[evaluation].default;
    }
    return theme.palette.grey.cloudy;
  }

  renderDomaineCompetences(domaine: IDomaine) {
    const competences = this.props.competences.filter(competence => competence.domaineId === domaine.id);
    const nameText = domaine.codification ? `${domaine.codification} - ${domaine.name}` : domaine.name;

    return (
      <>
        {domaine.degree > 1 && competences.length ? <SmallText>{nameText}</SmallText> : null}
        <FlatList
          data={competences}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.competenceContainer}>
              <SmallText style={UI_STYLES.flexShrink1}>{domaine.competences?.find(c => c.id === item.id)?.name}</SmallText>
              <View style={[styles.levelColorContainer, { backgroundColor: this.getLevelColor(item.evaluation) }]} />
            </View>
          )}
        />
        {domaine.domaines?.map(d => this.renderDomaineCompetences(d))}
      </>
    );
  }

  public render() {
    const { domaine } = this.props;
    const nameText = domaine.codification ? `${domaine.codification} - ${domaine.name}` : domaine.name;

    return (
      <ArticleContainer>
        <SmallText>{nameText}</SmallText>
        {this.renderDomaineCompetences(domaine)}
      </ArticleContainer>
    );
  }
}
