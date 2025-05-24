import { helloRouter } from '@/modules/hello/api/router';
import { postsRouter } from '@/modules/posts/api/router';
import { usersRouter } from '@/modules/users/api/router';

import { router } from './trpc';

export const appRouter = router({
  hello: helloRouter,
  posts: postsRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
