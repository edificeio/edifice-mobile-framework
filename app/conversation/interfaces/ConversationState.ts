import { Message, Thread } from ".";
import { IGroup, IUser } from "../../user/reducers";

export interface ConversationState {
  page: number;
  threads: Thread[];
  filterCriteria: string;
  synced: boolean;
  processing: Message[];
  refresh: boolean;
  refreshThreads: boolean;
  filterCleared: boolean;
  visibles: (IUser | IGroup)[];
  pickedUsers: (IUser | IGroup)[];
  remainingUsers: (IUser | IGroup)[];
  currentThread: string;
  fetching: boolean;
}
