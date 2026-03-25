import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { ThrottlerModule } from '@nestjs/throttler';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    ThrottlerModule.forRoot([
      {
        limit: 3,
        ttl: 60,
      },
    ]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get<string>('NODE_ENV') === 'production';

        if (isProduction) {
          // --- Se ejecutará con 'npm run prod' ---
          // Ajustado: removido manejo específico de Supabase/SSL.
          // Usaremos conexión Postgres estándar para producción (rellenar vars en .env.prod).
          const host = configService.get<string>('DB_HOST_PROD')!;
          const username = configService.get<string>('DB_USER_PROD')!;

          console.log('🚀 Connecting to PRODUCTION database...');
          console.log('📊 Server:', host);
          console.log('📊 Database:', configService.get<string>('DB_NAME_PROD'));
          console.log('👤 Username:', username);

          return {
            type: 'postgres',
            host: host,
            port: parseInt(configService.get<string>('DB_PORT_PROD', '5432')),
            username: username,
            password: configService.get<string>('DB_PASS_PROD')!,
            database: configService.get<string>('DB_NAME_PROD')!,
            autoLoadEntities: true, // Cargar entidades
            synchronize: false, // ✅ Seguridad: No sincronizar automáticamente en producción
            logging: true, // Activar logging para ver qué pasa
            // Nota: si necesita SSL (e.g., Supabase), reactivar aquí manualmente.
          };
        } else {
          // --- Se ejecutará con 'npm run dev' ---
          console.log('🔧 Connecting to DEVELOPMENT database (Local PostgreSQL)...');
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST')!,
            port: parseInt(configService.get<string>('DB_PORT', '5432')),
            username: configService.get<string>('DB_USER')!,
            password: configService.get<string>('DB_PASS')!,
            database: configService.get<string>('DB_NAME')!,
            autoLoadEntities: true,
            synchronize: true, // Ok para desarrollo
          };
        }
      },
    }),

    AuthModule,
    PatientsModule,
  ],
})
export class AppModule {}