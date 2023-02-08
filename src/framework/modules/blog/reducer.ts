/**
 * Blog Reducer
 */
import { Moment } from 'moment';
import { combineReducers } from 'redux';

import { Reducers } from '~/app/store';
import { ISession } from '~/framework/modules/auth/model';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';
import { resourceRightFilter } from '~/framework/util/resourceRights';

import moduleConfig from './module-config';
import { createBlogPostResourceRight } from './rights';

// Types

export interface Blog {
  id: string;
  visibility: string;
  title: string;
  thumbnail?: string;
  trashed?: boolean;
  'comment-type': string;
  'publish-type': string;
  description?: string;
  created: Moment;
  modified: Moment;
  author: { userId: string; username: string; login: string };
  shared?: ({
    [key: string]: boolean | string | undefined;
  } & {
    [key in 'userId' | 'groupId']: string;
  })[];
  fetchPosts: Omit<BlogPost, 'content'>[];
}
export type BlogList = Blog[];

export interface BlogPostComment {
  author: {
    login: string;
    userId: string;
    username: string;
  };
  coauthor?: {
    login: string;
    userId: string;
    username: string;
  };
  comment: string;
  created: Moment;
  id: string;
  modified?: Moment;
  state: string;
}

export type BlogPostComments = BlogPostComment[];

export interface BlogPost {
  author: {
    login: string;
    userId: string;
    username: string;
  };
  comments?: BlogPostComments;
  content: string;
  created: Moment;
  firstPublishDate?: Moment;
  modified: Moment;
  state: string;
  title: string;
  views: number;
  _id: string;
}

export type BlogPostList = BlogPost[];

export interface BlogFolder {
  id: string;
  name: string;
  owner: { userId: string; displayName: string };
  created: Moment;
  modified: Moment;
  trashed?: boolean;
  parentId?: string;
  resourceIds: string[];
}

// State

export type BlogFlatTree = {
  resources: Blog[];
  folders: ({
    depth: number;
  } & BlogFolderWithResources &
    BlogFolderWithChildren)[];
};

interface BlogStateData {
  blogs: Blog[];
  folders: BlogFolder[];
  tree: BlogFlatTree;
}
export interface BlogState {
  blogs: AsyncState<Blog[]>;
  folders: AsyncState<BlogFolder[]>;
  tree: BlogStateData['tree'];
}

// Reducer

const initialState: BlogStateData = {
  blogs: [],
  folders: [],
  tree: {
    resources: [],
    folders: [],
  },
};

export const actionTypes = {
  blogPosts: createAsyncActionTypes(moduleConfig.namespaceActionType('BLOG_POSTS')),
  blogs: createAsyncActionTypes(moduleConfig.namespaceActionType('BLOGS')),
  folders: createAsyncActionTypes(moduleConfig.namespaceActionType('FOLDERS')),
  tree: {
    compute: moduleConfig.namespaceActionType('TREE_COMPUTED'),
  },
};

/**
 * Computes folders hierarchy and calls a callback for every folder.
 * Note : be careful with deleted resources and folders, you must filter these list before call this function.
 * @param folders
 * @param callback
 * @returns
 */
export const computeFoldersHierarchy = <FolderType extends BlogFolder = BlogFolder>(
  folders: BlogFolder[],
  callback?: (f: BlogFolder) => FolderType,
) => {
  const ret = [] as (BlogFolderWithChildren & FolderType)[];
  const cleanFolders = folders.map(f => {
    const { children, ...ff } = f as BlogFolderWithChildren;
    return ff;
  });
  for (const f of cleanFolders) {
    // If parent is defined but not found, consider it has no parent.
    const parentFolder = f.parentId ? (cleanFolders.find(ff => ff.id === f.parentId) as BlogFolderWithChildren) : undefined;
    const ff = callback ? callback(f) : (f as FolderType);
    if (parentFolder) {
      parentFolder.children = [...(parentFolder.children ?? []), ff] as (BlogFolderWithChildren & FolderType)[];
    } else {
      ret.push(ff);
    }
  }
  return ret;
};

/**
 * Computes the full hierarchy, includings folders, subfolders and resources.
 * Note : be careful with deleted resources and folders, you must filter these list before call this function.
 * @param folders global list of all faolders
 * @param blogs global list of all resources
 * @returns
 */
export const computeAllBlogsHierarchy = <FolderType extends BlogFolder = BlogFolder>(folders: FolderType[], blogs: Blog[]) => {
  const idsOfAllBlogsThatAreInAFolder: string[] = [];

  const folderHierarchy = computeFoldersHierarchy(folders, f => {
    const blogsOfFolder = [] as Blog[];
    for (const resourceId of f.resourceIds) {
      const blog = blogs.find(bb => bb.id === resourceId);
      if (blog !== undefined) blogsOfFolder.push(blog);
    }
    (f as BlogFolderWithResources).resources = blogsOfFolder;
    idsOfAllBlogsThatAreInAFolder.push(...blogsOfFolder.map(b => b.id));
    return f as BlogFolderWithResources & FolderType;
  });

  const rootBlogs = blogs.filter(blog => !idsOfAllBlogsThatAreInAFolder.includes(blog.id));
  return {
    folders: folderHierarchy,
    resources: rootBlogs,
  };
};

/**
 * Same as computeAllBlogsHierarchy, but returns flatten folder list with depth info.
 * Each folder still has children information.
 * @param folders
 * @param blogs
 * @returns
 */
export const computeAllBlogsFlatHierarchy = <FolderType extends BlogFolder = BlogFolder>(folders: FolderType[], blogs: Blog[]) => {
  // Cleanup. Depth must be reset if there is already present.
  const cleanFolders = folders.map(f => {
    const { depth, ...ff } = f as { depth?: number } & BlogFolderWithChildren;
    return ff;
  }) as unknown as ({ depth?: number } & BlogFolderWithChildren & FolderType)[];
  const allHierarchy = computeAllBlogsHierarchy(cleanFolders, blogs);
  // Iterate over and flatten tree level after level.
  let depth = 0;
  const done = false;
  do {
    for (const f of allHierarchy.folders) {
      if (f.depth === undefined) {
        f.depth = depth;
      }
    }
    if (allHierarchy.folders.length >= folders.length) break;
    allHierarchy.folders = allHierarchy.folders.reduce(
      (acc, f) =>
        [
          ...acc,
          f,
          ...((f.children as ({ depth?: number } & BlogFolderWithChildren & FolderType)[])?.filter(ff => ff.depth === undefined) ||
            []),
        ] as typeof allHierarchy.folders,
      [] as typeof allHierarchy.folders,
    );
    ++depth;
  } while (!done);
  return {
    resources: allHierarchy.resources,
    folders: allHierarchy.folders as ({ depth: number } & BlogFolderWithResources & BlogFolderWithChildren & FolderType)[],
  };
};

// Getters

export const getPublishableBlogs = (session: ISession, blogs: BlogList) => {
  const publishableBlogs = (resourceRightFilter(blogs, createBlogPostResourceRight, session) as BlogList).filter(
    (blog: Blog) => !blog.trashed,
  );
  return publishableBlogs;
};

// Other functions

export const filterTrashed = <T extends { trashed?: boolean }>(items: T[], trashed: boolean) =>
  items.filter(i => (i.trashed || false) === trashed);

export interface BlogFolderWithResources extends BlogFolder {
  resources: Blog[];
}
export interface BlogFolderWithChildren extends BlogFolder {
  children?: BlogFolderWithChildren[];
}

const reducer = combineReducers({
  blogs: createSessionAsyncReducer(initialState.blogs, actionTypes.blogs),
  folders: createSessionAsyncReducer(initialState.folders, actionTypes.folders),
  tree: createSessionReducer(initialState.tree, {
    // eslint-disable-next-line @typescript-eslint/default-param-last
    [actionTypes.tree.compute]: (state = initialState.tree, action) => {
      const a = action as unknown as { blogs: Blog[]; folders: BlogFolder[] };
      return computeAllBlogsFlatHierarchy(a.folders, a.blogs);
    },
  }),
});
Reducers.register(moduleConfig.reducerName, reducer);
export default reducer;
