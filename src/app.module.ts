import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './services/config.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    //  TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'postgres',
    //   password: 'irfan',
    //   database: 'ablevue',
    //         //entities: ['**/*.entity{.ts,.js}'],
    //   synchronize: true,
    //   migrationsTableName: 'migration',
    //   migrations: ['src/migration/*.ts'],
      
    // }),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    UserModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
