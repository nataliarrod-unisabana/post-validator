import { Request, Response, Router } from 'express';
import { Post } from '../../domain/model/Post';
import { PostStatus } from '../../domain/model/PostStatus';
import { AccessLevel } from '../../domain/model/AccessLevel';
import { UserType } from '../../domain/model/UserType';
import { PostService } from '../../application/PostService';

export function buildPostRouter(service: PostService): Router {
  const router = Router();

  router.post('/posts', (req: Request, res: Response) => {
    try {
      const { title, content, authorId, status, accessLevel, scheduledFor } = req.body;
      const post = new Post(
        0,
        title ?? '',
        content ?? '',
        authorId ?? 0,
        (status as PostStatus) ?? PostStatus.DRAFT,
        (accessLevel as AccessLevel) ?? AccessLevel.PUBLIC,
        scheduledFor ? new Date(scheduledFor) : null
      );
      const result = service.createPost(post);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      return res.status(201).json(result.post);
    } catch (err) {
      return res.status(400).json({ error: 'BAD_REQUEST' });
    }
  });

  router.get('/posts', (_req: Request, res: Response) => {
    return res.status(200).json(service.listPosts());
  });

  router.get('/posts/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'INVALID_ID' });
    }
    const userType = (req.header('x-user-type') as UserType) ?? UserType.ANONYMOUS;
    const post = service.getPost(id, userType);
    if (!post) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }
    return res.status(200).json(post);
  });

  router.delete('/posts/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'INVALID_ID' });
    }
    const deleted = service.deletePost(id);
    if (!deleted) {
      return res.status(404).json({ error: 'NOT_FOUND' });
    }
    return res.status(204).send();
  });

  return router;
}
