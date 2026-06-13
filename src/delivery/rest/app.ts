import express, { Application, Request, Response, NextFunction } from 'express';
import { PostService } from '../../application/PostService';
import { InMemoryPostRepository } from '../../infrastructure/InMemoryPostRepository';
import { buildPostRouter } from './PostController';

export function buildApp(service?: PostService): Application {
  const app = express();
  app.use(express.json());

  const postService = service ?? new PostService(new InMemoryPostRepository());

  app.get('/health', (_req, res) => res.status(200).json({ status: 'OK' }));
  app.use('/api', buildPostRouter(postService));

  app.use((err: Error & { type?: string }, _req: Request, res: Response, next: NextFunction) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'MALFORMED_JSON' });
    }
    next(err);
  });

  return app;
}
