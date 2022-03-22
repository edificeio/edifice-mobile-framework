/**
 * Blog Reducer
 */

import { Moment } from 'moment';
import { combineReducers } from 'redux';

import { createSessionReducer } from '~/framework/util/redux/reducerFactory';
import { resourceRightFilter } from '~/framework/util/resourceRights';
import { IUserSession } from '~/framework/util/session';
import { AsyncState, createAsyncActionTypes, createSessionAsyncReducer } from '~/framework/util/redux/async';

import moduleConfig from './moduleConfig';
import { createBlogPostResourceRight } from './rights';

// Types

export interface IBlog {
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
  fetchPosts: Omit<IBlogPost, 'content'>[];
}
export type IBlogList = IBlog[];

export interface IBlogPostComment {
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

export type IBlogPostComments = IBlogPostComment[];

export interface IBlogPost {
  author: {
    login: string;
    userId: string;
    username: string;
  };
  comments?: IBlogPostComments;
  content: string;
  created: Moment;
  firstPublishDate?: Moment;
  modified: Moment;
  state: string;
  title: string;
  views: number;
  _id: string;
}

export type IBlogPostList = IBlogPost[];

export interface IBlogFolder {
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

export type IBlogFlatTree = {
  resources: IBlog[];
  folders: ({
    depth: number;
  } & IBlogFolderWithResources &
    IBlogFolderWithChildren)[];
};

interface IBlog_StateData {
  blogs: IBlog[];
  folders: IBlogFolder[];
  tree: IBlogFlatTree;
}
export interface IBlog_State {
  blogs: AsyncState<IBlog[]>;
  folders: AsyncState<IBlogFolder[]>;
  tree: IBlog_StateData['tree'];
}

// Reducer

const initialState: IBlog_StateData = {
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

export default combineReducers({
  blogs: createSessionAsyncReducer(initialState.blogs, actionTypes.blogs),
  folders: createSessionAsyncReducer(initialState.folders, actionTypes.folders),
  tree: createSessionReducer(initialState.tree, {
    [actionTypes.tree.compute]: (state = initialState.tree, action) => {
      const a = action as unknown as { blogs: IBlog[]; folders: IBlogFolder[] };
      return computeAllBlogsFlatHierarchy(a.folders, a.blogs);
    },
  }),
});

// Getters

export const getPublishableBlogs = (session: IUserSession, blogs: IBlogList) => {
  const publishableBlogs = (resourceRightFilter(blogs, createBlogPostResourceRight, session) as IBlogList).filter(
    (blog: IBlog) => !blog.trashed,
  );
  return publishableBlogs;
};

// Other functions

export const filterTrashed = <T extends { trashed?: boolean }>(items: Array<T>, trashed: boolean) =>
  items.filter(i => (i.trashed || false) === trashed);

export interface IBlogFolderWithResources extends IBlogFolder {
  resources: IBlog[];
}
export interface IBlogFolderWithChildren extends IBlogFolder {
  children?: IBlogFolderWithChildren[];
}

/**
 * Computes folders hierarchy and calls a callback for every folder.
 * Note : be careful with deleted resources and folders, you must filter these list before call this function.
 * @param folders
 * @param callback
 * @returns
 */
export const computeFoldersHierarchy = <FolderType extends IBlogFolder = IBlogFolder>(
  folders: IBlogFolder[],
  callback?: (f: IBlogFolder) => FolderType,
) => {
  const ret = [] as (IBlogFolderWithChildren & FolderType)[];
  //   console.log('computeFoldersHierarchy');
  // console.log('==== FOLDERS ', folders);
  const cleanFolders = folders.map(f => {
    const { children, ...ff } = f as IBlogFolderWithChildren;
    return ff;
  });
  // console.log("=== clean folders");
  for (const f of cleanFolders) {
    // console.log("=== iterate folder", f.name);
    // If parent is defined but not found, consider it has no parent.
    const parentFolder = f.parentId ? (cleanFolders.find(ff => ff.id === f.parentId) as IBlogFolderWithChildren) : undefined;
    const ff = callback ? callback(f) : (f as FolderType);
    if (parentFolder) {
      // console.log("  === parent is", parentFolder?.name);
      parentFolder.children = [...(parentFolder.children ?? []), ff] as (IBlogFolderWithChildren & FolderType)[];
    } else {
      // console.log("  === no parent");
      ret.push(ff);
    }
  }
  // return ret.filter(f => (f as IBlogFolderWithChildren).parentId === undefined);
  return ret;
};

/**
 * Computes the full hierarchy, includings folders, subfolders and resources.
 * Note : be careful with deleted resources and folders, you must filter these list before call this function.
 * @param folders global list of all faolders
 * @param blogs global list of all resources
 * @returns
 */
export const computeAllBlogsHierarchy = <FolderType extends IBlogFolder = IBlogFolder>(folders: FolderType[], blogs: IBlog[]) => {
  //   console.log('computeAllBlogsHierarchy');

  const idsOfAllBlogsThatAreInAFolder: string[] = [];

  const folderHierarchy = computeFoldersHierarchy(folders, f => {
    const blogsOfFolder = [] as IBlog[];
    for (const resourceId of f.resourceIds) {
      const blog = blogs.find(blog => blog.id === resourceId);
      if (blog !== undefined) blogsOfFolder.push(blog);
    }
    (f as IBlogFolderWithResources).resources = blogsOfFolder;
    idsOfAllBlogsThatAreInAFolder.push(...blogsOfFolder.map(b => b.id));
    return f as IBlogFolderWithResources & FolderType;
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
export const computeAllBlogsFlatHierarchy = <FolderType extends IBlogFolder = IBlogFolder>(
  folders: FolderType[],
  blogs: IBlog[],
) => {
  //   console.log('computeAllBlogsFlatHierarchy');
  // Cleanup. Depth must be reset if there is already present.
  const cleanFolders = folders.map(f => {
    const { depth, ...ff } = f as { depth?: number } & IBlogFolderWithChildren;
    return ff;
  }) as unknown as Array<{ depth?: number } & IBlogFolderWithChildren & FolderType>;
  let allHierarchy = computeAllBlogsHierarchy(cleanFolders, blogs);
  // Iterate over and flatten tree level after level.
  let depth = 0,
    done = false;
  do {
    for (const f of allHierarchy.folders) {
      if (f.depth === undefined) {
        f.depth = depth;
        // console.log("=== mark depth", depth, "to", f.name);
      }
    }
    if (allHierarchy.folders.length >= folders.length) break;
    allHierarchy.folders = allHierarchy.folders.reduce(
      (acc, f) =>
        [
          ...acc,
          f,
          ...((f.children as Array<{ depth?: number } & IBlogFolderWithChildren & FolderType>)?.filter(
            f => f.depth === undefined,
          ) || []),
        ] as typeof allHierarchy.folders,
      [] as typeof allHierarchy.folders,
    );
    // console.log("done", depth, foldersHierarchy.map(f => ({ name: f.name, depth: f.depth, children: f.children })), foldersHierarchy.length, folders.length);
    ++depth;
  } while (!done);
  return {
    resources: allHierarchy.resources,
    folders: allHierarchy.folders as Array<{ depth: number } & IBlogFolderWithResources & IBlogFolderWithChildren & FolderType>,
  };
};
