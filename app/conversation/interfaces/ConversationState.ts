import { Thread, Message } from ".";
import { IUser, IGroup } from "../../auth/reducer";

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
}