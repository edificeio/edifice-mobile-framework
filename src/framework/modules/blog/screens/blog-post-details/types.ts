/**
 * The post shown, by its blog (`BlogPostIds`): from the list, a notification or a resource. A `type`, not an interface:
 * `StaticScreenProps` needs a `Record`.
 */
export type BlogPostDetailsScreenNavParams = {
  blogId: string;
  postId: string;
};
