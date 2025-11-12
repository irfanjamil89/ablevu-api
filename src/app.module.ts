import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, configService } from './services/config.service';
import { AuthModule } from './auth/auth.module';
import { AccessibleFeatureTypeModule } from './accessible feature-type/accessible feature-type.module';
import { BusinessModule } from './business/business.module';
import { BusinessTypeModule } from './business-type/business-type.module';
import { AccessibleCityModule } from './accessible city/accessible-city.module';
import { AccessibleFeatureModule } from './accessible feature/accessible feature.module';
import { BusinessVirtualTourModule } from 'src/business virtual tour/business-virtual-tour.module'
import { User } from './auth/user.decorator';

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
    AuthModule,
    AccessibleFeatureTypeModule,
    BusinessModule,
    BusinessTypeModule,
    AccessibleCityModule,
    AccessibleFeatureModule,
    BusinessVirtualTourModule,
  ],
  controllers: [AppController],
  providers: [AppService, ConfigService],
})
export class AppModule {}
