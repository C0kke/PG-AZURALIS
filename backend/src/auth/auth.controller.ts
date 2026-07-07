import { Body, Controller, Get, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.name, dto.email, dto.password, dto.rut, dto.role);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const userId = req.user.sub; // El JWT tiene el id del usuario en el campo 'sub'
    return this.authService.getProfile(userId);
  }


  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    await this.authService.requestPasswordReset(email);
    return {
      message: 'Si el correo existe, se enviará un enlace de recuperación',
    };
  }


  @Throttle({ default: { limit: 3, ttl: 60,
  },
  })
  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.authService.resetPassword(token, newPassword);
    return { message: 'Contraseña actualizada correctamente' };
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Passport intercepta y redirige a Google — este cuerpo nunca se ejecuta
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: any, @Res() res: any) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!req.user) {
      return res.redirect(`${frontendUrl}/?google_error=1`);
    }

    const token = this.authService.signToken(req.user);
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

}
