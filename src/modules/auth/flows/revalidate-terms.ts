import { revalidateTerms as revalidateTermsOfPlatform } from '../service';
import { refreshRequirements } from './refresh-requirements';
import { assertConnectedAccount } from '../store/accounts';

/**
 * The connected account accepts the (new) terms of use, then its requirement is checked again.
 */
export const revalidateTerms = async () => {
  await revalidateTermsOfPlatform(assertConnectedAccount());
  return refreshRequirements();
};
