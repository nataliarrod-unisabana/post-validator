import { AccessControlService } from '../../../../src/domain/service/AccessControlService';
import { Post } from '../../../../src/domain/model/Post';
import { PostStatus } from '../../../../src/domain/model/PostStatus';
import { AccessLevel } from '../../../../src/domain/model/AccessLevel';
import { UserType } from '../../../../src/domain/model/UserType';

describe('AccessControlService', () => {

  const givenPost = (accessLevel: AccessLevel) =>
    new Post(1, 'Título', 'Contenido', 100, PostStatus.PUBLISHED, accessLevel);

  it('should allow access when post is PUBLIC and user is ANONYMOUS', () => {
    const service = new AccessControlService();
    const result = service.canAccess(givenPost(AccessLevel.PUBLIC), UserType.ANONYMOUS);
    expect(result).toBe(true);
  });

  it('should deny access when post is MEMBERS and user is ANONYMOUS', () => {
    const service = new AccessControlService();
    const result = service.canAccess(givenPost(AccessLevel.MEMBERS), UserType.ANONYMOUS);
    expect(result).toBe(false);
  });

  it('should allow access when post is MEMBERS and user is MEMBER', () => {
    const service = new AccessControlService();
    const result = service.canAccess(givenPost(AccessLevel.MEMBERS), UserType.MEMBER);
    expect(result).toBe(true);
  });

  it('should allow access when post is MEMBERS and user is PAID_MEMBER', () => {
    const service = new AccessControlService();
    const result = service.canAccess(givenPost(AccessLevel.MEMBERS), UserType.PAID_MEMBER);
    expect(result).toBe(true);
  });

  it('should deny access when post is PAID and user is MEMBER', () => {
    const service = new AccessControlService();
    const result = service.canAccess(givenPost(AccessLevel.PAID), UserType.MEMBER);
    expect(result).toBe(false);
  });

  it('should allow access when post is PAID and user is PAID_MEMBER', () => {
    const service = new AccessControlService();
    const result = service.canAccess(givenPost(AccessLevel.PAID), UserType.PAID_MEMBER);
    expect(result).toBe(true);
  });

  it('should allow access for ADMIN regardless of access level', () => {
    const service = new AccessControlService();
    const result = service.canAccess(givenPost(AccessLevel.PAID), UserType.ADMIN);
    expect(result).toBe(true);
  });

});