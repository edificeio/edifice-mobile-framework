/**
 * Presences workflow
 */
import { ISession } from '~/framework/modules/auth/model';

export const createAbsenceRight = 'fr.openent.presences.controller.FakeRight|AbsenceStatementsCreate';

export const getPresencesWorkflowInformation = (session: ISession) => ({
  createAbsence: session.authorizedActions.some(a => a.name === createAbsenceRight),
});
