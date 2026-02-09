import { AuthActiveAccount } from '~/framework/modules/auth/model';
import {
  annotationAdapter,
  averageAdapter,
  competenceAdapter,
  devoirAdapter,
  domaineAdapter,
  levelAdapter,
  subjectAdapter,
  userChildAdapter,
} from '~/framework/modules/viescolaire/competences/service/adapters';
import {
  IBackendAnnotationList,
  IBackendAverageList,
  IBackendCompetenceList,
  IBackendDevoirList,
  IBackendDomaineList,
  IBackendLevelList,
  IBackendSubjectList,
  IBackendUserChildren,
} from '~/framework/modules/viescolaire/competences/service/types';
import { sessionFetch } from '~/framework/util/transport';

export const competencesService = {
  annotations: {
    get: async (session: AuthActiveAccount, studentId: string, classId: string) => {
      const api = `/viescolaire/annotations/eleve?idEleve=${studentId}&idClasse=${classId}`;
      const annotations = await sessionFetch.json<IBackendAnnotationList>(api);
      return annotations.map(annotationAdapter);
    },
  },
  averages: {
    get: async (session: AuthActiveAccount, structureId: string, studentId: string, termId?: string) => {
      let api = `/competences/devoirs/notes?idEtablissement=${structureId}&idEleve=${studentId}`;
      if (termId) {
        api += `&idPeriode=${termId}`;
      }
      const averages = await sessionFetch.json<IBackendAverageList>(api);
      return averageAdapter(averages);
    },
  },
  competences: {
    get: async (session: AuthActiveAccount, studentId: string, classId: string) => {
      const api = `/viescolaire/competences/eleve?idEleve=${studentId}&idClasse=${classId}`;
      const competences = await sessionFetch.json<IBackendCompetenceList>(api);
      return competences.map(competenceAdapter);
    },
  },
  devoirs: {
    get: async (session: AuthActiveAccount, structureId: string, studentId: string) => {
      const api = `/competences/devoirs?idEtablissement=${structureId}&idEleve=${studentId}`;
      const devoirs = await sessionFetch.json<IBackendDevoirList>(api);
      return devoirs.map(devoirAdapter);
    },
  },
  domaines: {
    get: async (session: AuthActiveAccount, classId: string) => {
      const api = `/competences/domaines?idClasse=${classId}`;
      const domaines = await sessionFetch.json<IBackendDomaineList>(api);
      return domaines.map(domaineAdapter);
    },
  },
  levels: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/competences/maitrise/level/${structureId}`;
      const levels = await sessionFetch.json<IBackendLevelList>(api);
      return levels.map(levelAdapter);
    },
  },
  subjects: {
    get: async (session: AuthActiveAccount, structureId: string) => {
      const api = `/viescolaire/matieres/services-filter?idEtablissement=${structureId}`;
      const subjects = await sessionFetch.json<IBackendSubjectList>(api);
      return subjects.map(subjectAdapter);
    },
  },
  userChildren: {
    get: async (session: AuthActiveAccount, structureId: string, relativeId: string) => {
      const api = `/competences/enfants?idEtablissement=${structureId}&userId=${relativeId}`;
      const userChildren = await sessionFetch.json<IBackendUserChildren>(api);
      return userChildren.map(userChildAdapter);
    },
  },
};
