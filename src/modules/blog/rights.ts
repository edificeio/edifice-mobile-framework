/**
 * Blog workflow
 */

import { registerTimelineWorkflow } from "../../framework/modules/timelinev2/timelineModules";
import { resourceHasRight } from "../../framework/resourceRights";
import { IUserSession } from "../../framework/session";
import { IBlog } from "./reducer";

export const createBlogPostResourceRight = "org-entcore-blog-controllers-PostController|create"
export const submitBlogPostResourceRight = "org-entcore-blog-controllers-PostController|submit";
export const publishBlogPostResourceRight = "org-entcore-blog-controllers-PostController|publish";

export const listBlogsResourceRight = "org.entcore.blog.controllers.BlogController|list";
export const printBlogResourceRight =  "org.entcore.blog.controllers.BlogController|print";
export const viewBlogResourceRight =  "org.entcore.blog.controllers.BlogController|blog";
export const createBlogResourceRight =  "org.entcore.blog.controllers.BlogController|create";
export const createPublicBlogResourceRight =  "org.entcore.blog.controllers.BlogController|createPublicBlog";
export const publishBlogResourceRight =  "org.entcore.blog.controllers.BlogController|publish";

export const addBlogFolderResourceRight =  "org.entcore.blog.controllers.FoldersController|add";

export const getBlogPostRight = (blog: IBlog, session: IUserSession) => {
    if (resourceHasRight(blog, publishBlogPostResourceRight, session) || blog["publish-type"] === "IMMEDIATE") {
        return publishBlogPostResourceRight;
    } else if (!resourceHasRight(blog, publishBlogPostResourceRight, session) && blog["publish-type"] === "RESTRAINT") {
        return submitBlogPostResourceRight;
    } else if (resourceHasRight(blog, createBlogPostResourceRight, session)) {
        return createBlogPostResourceRight;
    } else return undefined;
}

export const getBlogWorkflowInformation = (session: IUserSession) => ({
    blog: {
        list: session.user.authorizedActions.some(a => a.name === listBlogsResourceRight),
        print: session.user.authorizedActions.some(a => a.name === printBlogResourceRight),
        view: session.user.authorizedActions.some(a => a.name === viewBlogResourceRight),
        create: session.user.authorizedActions.some(a => a.name === createBlogResourceRight),
        createPublic: session.user.authorizedActions.some(a => a.name === createPublicBlogResourceRight),
        publish: session.user.authorizedActions.some(a => a.name === publishBlogResourceRight),
    },
    folder: {
        add: session.user.authorizedActions.some(a => a.name === addBlogFolderResourceRight),
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
