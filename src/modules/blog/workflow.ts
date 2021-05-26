/**
 * Blog workflow
 */

import { registerTimelineWorkflow } from "../../framework/modules/timelinev2/timelineModules";
import { IUserSession } from "../../framework/session";

export const getBlogWorkflowInformation = (session: IUserSession) => ({
    blog: {
        list: session.user.authorizedActions.some(a => a.name === "org.entcore.blog.controllers.BlogController|list"),
        print: session.user.authorizedActions.some(a => a.name === "org.entcore.blog.controllers.BlogController|print"),
        view: session.user.authorizedActions.some(a => a.name === "org.entcore.blog.controllers.BlogController|blog"),
        create: session.user.authorizedActions.some(a => a.name === "org.entcore.blog.controllers.BlogController|create"),
        createPublic: session.user.authorizedActions.some(a => a.name === "org.entcore.blog.controllers.BlogController|createPublicBlog"),
        publish: session.user.authorizedActions.some(a => a.name === "org.entcore.blog.controllers.BlogController|publish"),
    },
    folder: {
        add: session.user.authorizedActions.some(a => a.name === "org.entcore.blog.controllers.FoldersController|add"),
    }
});

export default () => registerTimelineWorkflow(session => {
    const wk = getBlogWorkflowInformation(session);
    return wk.blog.create && {
        icon: 'bullhorn',
        i18n: 'blog.resourceName',
        goTo: { routeName: 'blog/select' }
    }
});
