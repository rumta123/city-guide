// src/controllers/review.controller.ts
import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from '../dto/create-review.dto';
import { Review } from '../entities/review.entity';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto): Promise<Review> {
    return this.reviewService.create(createReviewDto);
  }

  @Get()
  async findAll(): Promise<Review[]> {
    return this.reviewService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Review> {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateReviewDto: Partial<CreateReviewDto>): Promise<Review> {
    return this.reviewService.update(id, updateReviewDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<void> {
    return this.reviewService.remove(id);
  }
}
