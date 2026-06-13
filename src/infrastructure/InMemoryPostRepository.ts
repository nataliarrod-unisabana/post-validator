import { Post } from '../domain/model/Post';
import { PostRepository } from '../application/PostRepository';

export class InMemoryPostRepository implements PostRepository {
  private posts: Map<number, Post> = new Map();
  private nextId: number = 1;

  save(post: Post): Post {
    const id = post.id || this.nextId++;
    const saved = new Post(
      id,
      post.title,
      post.content,
      post.authorId,
      post.status,
      post.accessLevel,
      post.scheduledFor,
      post.contentBlocks
    );
    this.posts.set(id, saved);
    return saved;
  }

  findById(id: number): Post | null {
    return this.posts.get(id) ?? null;
  }

  findAll(): Post[] {
    return Array.from(this.posts.values());
  }

  delete(id: number): boolean {
    return this.posts.delete(id);
  }

  clear(): void {
    this.posts.clear();
    this.nextId = 1;
  }
}
