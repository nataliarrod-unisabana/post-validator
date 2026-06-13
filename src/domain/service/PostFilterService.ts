import { Post } from '../model/Post';
import { PostStatus } from '../model/PostStatus';

/**
 * Filtra, busca y ordena posts según diferentes criterios.
 *
 * Reglas de negocio:
 *  R1. Filtrar por status devuelve solo posts con ese status
 *  R2. Filtrar por authorId devuelve solo posts de ese autor
 *  R3. La búsqueda por título es case-insensitive
 *  R4. La búsqueda por título coincide con substring
 *  R5. Ordenar ASC/DESC funciona alfabéticamente por título
 *  R6. Si el query está vacío devuelve la lista original
 */
export class PostFilterService {
  filterByStatus(posts: Post[], status: PostStatus): Post[] {
    return posts.filter(p => p.status === status);
  }

  filterByAuthor(posts: Post[], authorId: number): Post[] {
    return posts.filter(p => p.authorId === authorId);
  }

  searchByTitle(posts: Post[], query: string): Post[] {
    return posts.filter(p => p.title.includes(query));
  }

  sortByTitle(posts: Post[], order: 'ASC' | 'DESC' = 'ASC'): Post[] {
    const sorted = [...posts].sort((a, b) => a.title.localeCompare(b.title));
    return order === 'DESC' ? sorted.reverse() : sorted;
  }
}
