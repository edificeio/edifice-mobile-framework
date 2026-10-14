import { IUserRequirements } from '~/framework/modules/auth/service';
import { tokenFetch } from '~/framework/util/transport';

import { AuthLoggedAccount, AuthRequirement } from '../model';

export const requirementsThatNeedLegalUrls = [AuthRequirement.MUST_REVALIDATE_TERMS, AuthRequirement.MUST_VALIDATE_TERMS];

export const requirements = {
  get: async (tokens: Pick<AuthLoggedAccount, 'tokens'>) => {
    return requirements.getNextNeeded(await requirements.getState(tokens));
  },
  /**
   * Get flags status for the current user.
   * These flags may lead to partial session scenarios
   * where the user needs to do some action before retrying to login.
   *
   * CAUTION : the 'forceChangePassword' flag received from the server corresponds to a field named 'changePw' in the database.
   *
   * @param userRequirements get userRequirements from `fetchUserRequirements()`
   * @returns the first flag encountered (until there is none).
   */
  getNextNeeded: (userRequirements: IUserRequirements) => {
    // Note : MUST_CHANGE_PASSWORD need to be first, otherwise the other cases will not work and will be http 302.
    if (userRequirements.forceChangePassword) return AuthRequirement.MUST_CHANGE_PASSWORD;
    if (userRequirements.needRevalidateTerms) return AuthRequirement.MUST_REVALIDATE_TERMS;
    // When the requirement for initial CGU validation for federated accounts, put it here :)
    if (userRequirements.needRevalidateMobile) return AuthRequirement.MUST_VERIFY_MOBILE;
    if (userRequirements.needRevalidateEmail) return AuthRequirement.MUST_VERIFY_EMAIL;
  },
  getState: async ({ tokens }: Pick<AuthLoggedAccount, 'tokens'>) =>
    tokenFetch.json<IUserRequirements>(tokens, '/auth/user/requirements'),
};
