import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { Place } from '../entities/place.entity';
// Подставьте путь к CategoryModule

import { CategoryModule } from 'src/category/category.module';
import { Category } from '../entities/category.entity';
import { ReviewModule } from 'src/review/review.module';
import { Review } from 'src/entities/review.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Place, Category, Review]), // Импорт Place и любых других сущностей
    CategoryModule, // Импорт CategoryModule, если CategoryRepository экспортируется оттуда
    ReviewModule,
  ],
  providers: [PlacesService],
  controllers: [PlacesController],
})
export class PlacesModule {}
