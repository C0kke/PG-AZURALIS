import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  // Deshabilita la serialización de sesión — usamos JWT stateless
  getAuthenticateOptions(_context: ExecutionContext) {
    return { session: false };
  }
}
