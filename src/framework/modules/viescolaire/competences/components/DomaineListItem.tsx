import * as React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import theme from '~/app/theme';
import { UI_SIZES, UI_STYLES } from '~/framework/components/constants';
import { BodyBoldText, SmallBoldText, SmallText } from '~/framework/components/text';
import { ICompetence, IDomaine, ILevel } from '~/framework/modules/viescolaire/competences/model';

const styles = StyleSheet.create({
  competenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: UI_SIZES.spacing.minor,
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
    const { levels } = this.props;

    if (evaluation >= 0 && evaluation < levels.length) {
      return levels[evaluation].color ?? levels[evaluation].defaultColor;
    }
    return theme.palette.grey.cloudy;
  }

  renderDomaineCompetences(domaine: IDomaine) {
    const competences = this.props.competences.filter(competence => competence.domaineId === domaine.id);
    const nameText = domaine.codification ? `${domaine.codification} - ${domaine.name}` : domaine.name;

    return (
      <>
        <FlatList
          data={competences}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.competenceContainer}>
              <SmallText style={UI_STYLES.flexShrink1}>{item.name}</SmallText>
              <View style={[styles.levelColorContainer, { backgroundColor: this.getLevelColor(item.evaluation) }]} />
            </View>
          )}
          ListHeaderComponent={domaine.degree > 1 && competences.length ? <SmallBoldText>{nameText}</SmallBoldText> : null}
        />
        {domaine.domaines?.map(d => this.renderDomaineCompetences(d))}
      </>
    );
  }

  public render() {
    const { domaine } = this.props;
    const nameText = domaine.codification ? `${domaine.codification} - ${domaine.name}` : domaine.name;

    return (
      <View>
        <BodyBoldText>{nameText}</BodyBoldText>
        {this.renderDomaineCompetences(domaine)}
      </View>
    );
  }
}
