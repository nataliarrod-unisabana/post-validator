import { Post } from '../model/Post';
import { AccessLevel } from '../model/AccessLevel';
import { UserType } from '../model/UserType';

/**
 * Controla el acceso a posts según el nivel configurado y el tipo de usuario.
 *
 * Reglas de negocio:
 *  R1. Posts PUBLIC son accesibles para todos (incluido ANONYMOUS)
 *  R2. Posts MEMBERS requieren al menos MEMBER
 *  R3. Posts PAID requieren PAID_MEMBER o ADMIN
 *  R4. ADMIN siempre tiene acceso sin importar el nivel
 */
export class AccessControlService {
  canAccess(post: Post, userType: UserType): boolean {
    if (post.accessLevel === AccessLevel.PUBLIC) return true;
    if (userType === UserType.ADMIN) return true;
    return false;
  }
}
