import { Post } from '../domain/model/Post';

export interface PostRepository {
  save(post: Post): Post;
  findById(id: number): Post | null;
  findAll(): Post[];
  delete(id: number): boolean;
  clear(): void;
}
