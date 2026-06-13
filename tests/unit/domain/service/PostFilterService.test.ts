import { PostFilterService } from '../../../../src/domain/service/PostFilterService';
import { Post } from '../../../../src/domain/model/Post';
import { PostStatus } from '../../../../src/domain/model/PostStatus';
import { AccessLevel } from '../../../../src/domain/model/AccessLevel';

describe('PostFilterService', () => {

  const givenPosts = (): Post[] => [
    new Post(1, 'TypeScript Avanzado', 'C', 100, PostStatus.PUBLISHED, AccessLevel.PUBLIC),
    new Post(2, 'jest para principiantes', 'C', 100, PostStatus.DRAFT, AccessLevel.PUBLIC),
    new Post(3, 'TDD en práctica', 'C', 200, PostStatus.PUBLISHED, AccessLevel.MEMBERS),
    new Post(4, 'Borrador pendiente', 'C', 200, PostStatus.DRAFT, AccessLevel.PUBLIC)
  ];

  it('should return only PUBLISHED posts when filtering by PUBLISHED status', () => {
    const service = new PostFilterService();
    const result = service.filterByStatus(givenPosts(), PostStatus.PUBLISHED);
    expect(result).toHaveLength(2);
    expect(result.every(p => p.status === PostStatus.PUBLISHED)).toBe(true);
  });

  it('should return empty array when no post matches the status', () => {
    const service = new PostFilterService();
    const result = service.filterByStatus(givenPosts(), PostStatus.SCHEDULED);
    expect(result).toHaveLength(0);
  });

  it('should return only posts of given author when filtering by authorId', () => {
    const service = new PostFilterService();
    const result = service.filterByAuthor(givenPosts(), 100);
    expect(result).toHaveLength(2);
    expect(result.every(p => p.authorId === 100)).toBe(true);
  });

  it('should return empty array when no post matches the author', () => {
    const service = new PostFilterService();
    const result = service.filterByAuthor(givenPosts(), 999);
    expect(result).toHaveLength(0);
  });

  it('should perform case-insensitive substring search on title', () => {
    const service = new PostFilterService();
    const result = service.searchByTitle(givenPosts(), 'typescript');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('TypeScript Avanzado');
  });

  it('should return empty array when title query does not match any post', () => {
    const service = new PostFilterService();
    const result = service.searchByTitle(givenPosts(), 'xyz123');
    expect(result).toHaveLength(0);
  });

  it('should return original list unchanged when query is empty string', () => {
    const service = new PostFilterService();
    const result = service.searchByTitle(givenPosts(), '');
    expect(result).toHaveLength(4);
  });

  it('should sort posts ASC by title alphabetically', () => {
    const service = new PostFilterService();
    const result = service.sortByTitle(givenPosts(), 'ASC');
    expect(result[0].title).toBe('Borrador pendiente');
    expect(result[3].title).toBe('TypeScript Avanzado');
  });

  it('should sort posts DESC by title alphabetically', () => {
    const service = new PostFilterService();
    const result = service.sortByTitle(givenPosts(), 'DESC');
    expect(result[0].title).toBe('TypeScript Avanzado');
    expect(result[3].title).toBe('Borrador pendiente');
  });

});