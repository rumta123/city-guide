import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from 'dotenv';
// import { UserModule } from './user/user.module'; // Подставьте путь к вашему модулю пользователей
import { PlacesModule } from './places/places.module';
import { EventsModule } from './events/events.module';

config(); // Загружает переменные окружения из файла .env
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('DB_HOST');
        const port = configService.get('DB_PORT');
        const username = configService.get('DB_USERNAME');
        const password = configService.get('DB_PASSWORD');
        const database = configService.get('DB_DATABASE');

        return {
          type: 'postgres',
          host,
          port: parseInt(port), // Преобразуем в число
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
        };
      },
      inject: [ConfigService],
    }),
    PlacesModule,
    EventsModule,

    // UserModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
