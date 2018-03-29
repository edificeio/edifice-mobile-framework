import { Thread, Message } from ".";
import { User, Group } from "../../model/Auth";

export interface ConversationState {
	page: number;
	threads: Thread[];
	filterCriteria: string;
	synced: boolean;
	processing: Message[];
	refresh: boolean;
	refreshThreads: boolean;
    filterCleared: boolean;
	visibles: (User | Group)[];
	pickedUsers: (User | Group)[];
	remainingUsers: (User | Group)[];
	currentThread: string;
}