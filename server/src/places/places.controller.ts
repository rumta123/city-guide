import { Controller, Get, Post, Param, Body, Put, Delete } from '@nestjs/common';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { CreateReviewDto } from 'src/dto/create-review.dto';
import { Review } from 'src/entities/review.entity';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  findAll() {
    return this.placesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placesService.findOne(Number(id));
  }

  @Post()
  create(@Body() createPlaceDto: CreatePlaceDto) {
    return this.placesService.create(createPlaceDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePlaceDto: Partial<CreatePlaceDto>) {
    return this.placesService.update(Number(id), updatePlaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.placesService.remove(Number(id));
  }

  @Post(':id/reviews')
  async addReview(@Param('id') id: number, @Body() createReviewDto: CreateReviewDto): Promise<Review> {
    return this.placesService.addReview(id, createReviewDto);
  }
}
