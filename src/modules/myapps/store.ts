import { create } from 'zustand';

import { SvgIconName } from '~/framework/components/picture';

type State = {};

export interface EntApplication {
  name: string; // unique ID of the EntApplication
  address: string;
  icon: SvgIconName;
}

export const useMyAppsStore = create<State>()(() => ({}));
