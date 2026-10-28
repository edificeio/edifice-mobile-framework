import service from '~/modules/auth/service';
import { assertActiveAccount } from '~/modules/auth/store/accounts';

import type { createRefreshRequirements } from './refresh-requirements';

/**
 * The connected account accepts the (new) terms of use, then its requirement is checked again.
 */
export const createRevalidateTerms = (refreshRequirements: ReturnType<typeof createRefreshRequirements>) => async () => {
  await service.revalidateTerms(assertActiveAccount());
  return refreshRequirements();
};
