import { blogPostGenerateResourceUriFunction, blogUriCaptureFunction } from './resource-uri';

const BLOG_ID = '0a1b2c3d-0a1b-0a1b-0a1b-0a1b2c3d4e5f';
const POST_ID = '9f8e7d6c-9f8e-9f8e-9f8e-9f8e7d6c5b4a';

describe('blogUriCaptureFunction', () => {
  it('captures the blog and the post of the address of a post', () => {
    expect(blogUriCaptureFunction(`/blog#/detail/${BLOG_ID}/${POST_ID}`)).toEqual({ blogId: BLOG_ID, postId: POST_ID });
  });

  it('captures the blog of the address of a blog', () => {
    expect(blogUriCaptureFunction(`/blog#/view/${BLOG_ID}`)).toEqual({ blogId: BLOG_ID });
  });

  it('captures nothing from another address', () => {
    expect(blogUriCaptureFunction('/wiki#/view/abc')).toEqual({ blogId: undefined });
  });

  it('reads back the address of a post it gives', () => {
    expect(blogUriCaptureFunction(blogPostGenerateResourceUriFunction({ blogId: BLOG_ID, postId: POST_ID }))).toEqual({
      blogId: BLOG_ID,
      postId: POST_ID,
    });
  });
});
