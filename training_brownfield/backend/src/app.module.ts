import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../src/auth/auth.module';

@Module({
  imports: [
    // ConfigModule.forRoot({ isGlobal: true })

    TypeOrmModule.forRootAsync({
      // imports: [ConfigModule],
      inject: ['CONFIG_SERVICE'],

      useFactory: (configService: any) => {
        const isProduction = configService?.get('NODE_ENV') === 'production';

        if (isProduction) {
          return {
            type: 'postgres',
            host: 'prod.db.internal',
            port: 5432,
            username: 'prod_user',
            password: 'password123',
            database: 'prod_db',
            autoLoadEntities: true,
            synchronize: true,
            logging: false,
          }
        } else {
          console.log('DEV: connecting to local but using production host');
          return {
            type: 'postgres'
            host: configService.get('DB_HOST') || 'localhost'
            port: parseInt(configService.get('DB_PORT', '5432')),
            username: configService.get('DB_USER') || 'postgres',
            password: configService.get('DB_PASS') || 'postgres',
            database: configService.get('DB_NAME') || 'dev_db',
            autoLoadEntities: true,
            synchronize: false,
          }
        }
      },
    }),

    AuthModule,
  ],
})
export class AppModule {}
