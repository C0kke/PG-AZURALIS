import { Injectable, ConflictException, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../shared/enums/user-role.enum';
import * as crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { MoreThan } from 'typeorm';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(
    name: string,
    email: string,
    password: string,
    rut: string,
    role: UserRole = UserRole.PATIENT,
  ) {
    this.logger.log(`Attempting to register user with email: ${email}`);

    // Verificar si el email ya existe
    const existingEmail = await this.usersRepo.findOne({ where: { email } });
    if (existingEmail) {
      this.logger.warn(`Registration failed: Email already exists: ${email}`);
      throw new ConflictException('Este correo ya está registrado. ¿Quieres iniciar sesión?');
    }

    // Verificar si el RUT ya existe
    const existingRut = await this.usersRepo.findOne({ where: { rut } });
    if (existingRut) {
      this.logger.warn(`Registration failed: RUT already exists: ${rut}`);
      throw new ConflictException('Este RUT ya está registrado en el sistema.');
    }

    try {
      const hashed = await bcrypt.hash(password, 10);
      const user = this.usersRepo.create({ name, email, rut, password: hashed, role });
      
      await this.usersRepo.save(user);
      this.logger.log(`User successfully registered: ${email} (ID: ${user.id})`);

      return {
        message: 'Usuario registrado con éxito',
        email: user.email,
        role: user.role,
        id: user.id,
      };
    } catch (error) {
      // Manejo de errores de base de datos como fallback
      this.logger.error(`Database error during registration for ${email}: ${error.message}`, error.stack);
      
      if (error.number === 2627 || error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          throw new ConflictException('Este correo ya está registrado.');
        } else if (error.message.includes('rut') || error.message.includes('RUT')) {
          throw new ConflictException('Este RUT ya está registrado.');
        }
        throw new ConflictException('Este usuario ya existe en el sistema.');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    this.logger.log(`Login attempt for email: ${email}`);

    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`Login failed: User not found for email: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.password) {
      throw new UnauthorizedException('Esta cuenta usa inicio de sesión con Google. Usa el botón "Continuar con Google".');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      this.logger.warn(`Login failed: Invalid password for email: ${email}`);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    
    this.logger.log(`User successfully logged in: ${email} (ID: ${user.id})`);
    
    return { access_token: token, role: user.role };
  }

  async getProfile(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      this.logger.warn(`User profile not found for ID: ${id}`);
      throw new BadRequestException('Usuario no encontrado');
    }

    // Parsear campos JSON para enviar al frontend
    const userData: any = { ...user };
    
    // Parsear scanHistory si existe (para doctores/enfermeras) y renombrarlo a searchHistory para el frontend
    if (user.scanHistory) {
      try {
        userData.searchHistory = JSON.parse(user.scanHistory);
      } catch (e) {
        this.logger.error(`Error parsing scanHistory for user ${id}:`, e);
        userData.searchHistory = [];
      }
    }
    
    delete userData.scanHistory;

    // Parsear assignedPatients si existe
    if (user.assignedPatients) {
      try {
        userData.assignedPatients = JSON.parse(user.assignedPatients);
      } catch (e) {
        this.logger.error(`Error parsing assignedPatients for user ${id}:`, e);
        userData.assignedPatients = [];
      }
    }

    // Parsear patientIds si existe (para guardianes)
    if (user.patientIds) {
      try {
        userData.patientIds = JSON.parse(user.patientIds);
      } catch (e) {
        this.logger.error(`Error parsing patientIds for user ${id}:`, e);
        userData.patientIds = [];
      }
    }

    // No devolver el password al frontend
    delete userData.password;

    this.logger.debug(`User profile retrieved for ID: ${id}`);
    return userData;
  }


  async requestPasswordReset(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });

    if (!user) {
      return;
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    user.passwordResetToken = hashedCode;
    user.passwordResetExpires = new Date(
      Date.now() + Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) * 60_000,
    );

    await this.usersRepo.save(user);

    await this.mailService.sendPasswordReset(user.email, code);
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await this.usersRepo.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await this.usersRepo.save(user);
  }

  async validateOrCreateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    photo: string | null;
  }) {
    // Primero buscar por googleId
    let user = await this.usersRepo.findOne({ where: { googleId: profile.googleId } });
    if (user) return user;

    // Si el email ya existe, vincular la cuenta de Google
    user = await this.usersRepo.findOne({ where: { email: profile.email } });
    if (user) {
      user.googleId = profile.googleId;
      if (!user.photo && profile.photo) user.photo = profile.photo;
      return this.usersRepo.save(user);
    }

    // Crear usuario nuevo
    const newUser = this.usersRepo.create({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      photo: profile.photo ?? undefined,
      role: UserRole.PATIENT,
    });
    return this.usersRepo.save(newUser);
  }

  signToken(user: { id: string; email: string; role: UserRole }): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }


}
