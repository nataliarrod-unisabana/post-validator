import { Post } from '../model/Post';
import { AccessLevel } from '../model/AccessLevel';
import { UserType } from '../model/UserType';

export class AccessControlService {
  canAccess(post: Post, userType: UserType): boolean {
    if (userType === UserType.ADMIN) return true;
    if (post.accessLevel === AccessLevel.PUBLIC) return true;
    if (post.accessLevel === AccessLevel.MEMBERS && 
       (userType === UserType.MEMBER || userType === UserType.PAID_MEMBER)) return true;
    if (post.accessLevel === AccessLevel.PAID && 
        userType === UserType.PAID_MEMBER) return true;
    return false;
  }
}