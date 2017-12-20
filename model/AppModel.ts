import { me } from "./User";
import { Conversation } from './Conversation';
import { Timeline } from "./Timeline";
import { Workspace } from "./Document";
import { Eventer } from "entcore-toolkit";

class AppModel{
    me = me;
    conversation = Conversation;
    workspace = Workspace;
    timeline = Timeline;
    eventer = new Eventer();

    plug (component) {
        this.eventer.on('change', () => {
            component.state.appModel = this;
            component.setState(component.state)
        });
        return this;
    }
}

export const appModel = new AppModel();