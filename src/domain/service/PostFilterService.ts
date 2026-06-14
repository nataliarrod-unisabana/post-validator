import { Post } from '../model/Post';
import { PostStatus } from '../model/PostStatus';

export class PostFilterService {
  filterByStatus(posts: Post[], status: PostStatus): Post[] {
    return posts.filter(p => p.status === status);
  }

  filterByAuthor(posts: Post[], authorId: number): Post[] {
    return posts.filter(p => p.authorId === authorId);
  }

  searchByTitle(posts: Post[], query: string): Post[] {
    if (query === '') return posts;
    return posts.filter(p => 
      p.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  sortByTitle(posts: Post[], order: 'ASC' | 'DESC' = 'ASC'): Post[] {
    const sorted = [...posts].sort((a, b) => a.title.localeCompare(b.title));
    return order === 'DESC' ? sorted.reverse() : sorted;
  }
}
