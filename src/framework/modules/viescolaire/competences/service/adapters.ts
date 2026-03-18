import moment from 'moment';

import {
  IAverage,
  ICompetence,
  IDevoir,
  IDomaine,
  ILevel,
  ISubject,
  IUserChild,
} from '~/framework/modules/viescolaire/competences/model';
import {
  IBackendAnnotation,
  IBackendAverageList,
  IBackendCompetence,
  IBackendDevoir,
  IBackendDomaine,
  IBackendLevel,
  IBackendSubject,
  IBackendUserChild,
} from '~/framework/modules/viescolaire/competences/service/types';

export const annotationAdapter = (data: IBackendAnnotation): IDevoir => {
  return {
    coefficient: data.coefficient,
    date: moment(data.date),
    diviseur: Number(data.diviseur),
    id: data.id_devoir,
    isEvaluated: data.is_evaluated,
    libelle: data.libelle ?? undefined,
    moyenne: String(Number((Number(data.sum_notes) / data.nbr_eleves).toFixed(1))),
    name: data.name,
    note: data.libelle_court,
    subjectId: data.id_matiere,
    termId: data.id_periode,
  };
};

export const averageAdapter = (list: IBackendAverageList): IAverage[] => {
  return Object.entries(list).map(([subjectId, data]) => {
    return {
      average: data.moyenne,
      subject: data.matiere,
      subjectCoefficient: data.matiere_coeff,
      subjectId,
      subjectRank: data.matiere_rank,
      teacher: data.teacher,
    };
  });
};

export const competenceAdapter = (data: IBackendCompetence): ICompetence => {
  return {
    date: moment(data.date),
    devoirId: data.id_devoir,
    domaineId: data.id_domaine,
    evaluation: data.evaluation,
    id: data.id_competence,
    ownerName: data.owner_name,
    subjectId: data.id_matiere,
  };
};

export const devoirAdapter = (data: IBackendDevoir): IDevoir => {
  return {
    coefficient: data.coefficient,
    date: moment(data.date),
    diviseur: data.diviseur,
    id: data.id,
    isEvaluated: data.is_evaluated,
    libelle: data.libelle ?? undefined,
    moyenne: String(Number((Number(data.sum_notes) / data.nbr_eleves).toFixed(1))),
    name: data.name,
    note: data.note,
    subjectId: data.id_matiere,
    teacher: data.teacher,
    termId: data.id_periode,
  };
};

export const compareDevoirs = (a: IDevoir, b: IDevoir): number => {
  return b.date.diff(a.date);
};

// Append assessments with no grade to given assessment array
export const concatDevoirs = (devoirs: IDevoir[], competences: ICompetence[]): IDevoir[] => {
  return devoirs
    .concat(
      competences
        .filter(c => !devoirs.map(d => d.id).includes(c.devoirId))
        .map(
          c =>
            ({
              date: c.date,
              id: c.devoirId,
              subjectId: c.subjectId,
              teacher: c.ownerName,
            }) as IDevoir,
        )
        .filter((devoir, index, array) => array.findIndex(d => d.id === devoir.id) === index),
    )
    .sort(compareDevoirs);
};

export const domaineAdapter = (data: IBackendDomaine): IDomaine => {
  return {
    codification: data.codification,
    competences: data.competences?.map(c => ({
      hidden: c.masque,
      id: c.id,
      name: c.nom,
    })),
    cycleId: data.id_cycle,
    degree: data.niveau,
    domaines: data.domaines?.map(domaineAdapter),
    id: data.id,
    name: data.nom,
  };
};

export const levelAdapter = (data: IBackendLevel): ILevel => {
  return {
    color: data.couleur,
    cycleId: data.id_cycle,
    defaultColor: data.default,
    id: data.id ?? data.id_niveau,
    label: data.libelle,
    order: data.ordre,
  };
};

export const subjectAdapter = (data: IBackendSubject): ISubject => {
  return {
    id: data.id,
    name: data.name,
    rank: data.rank,
  };
};

export const userChildAdapter = (data: IBackendUserChild): IUserChild => {
  return {
    classId: data.idClasse,
    cycleId: data.id_cycle,
    displayName: data.displayName,
    firstName: data.firstName,
    id: data.id,
    lastName: data.lastName,
    structureId: data.idStructure,
  };
};
