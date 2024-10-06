// src/services/review.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = this.reviewRepository.create(createReviewDto);
    return this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find();
  }

  async findOne(id: number): Promise<Review> {
    return this.reviewRepository.findOne({where:{id}});
  }

  async update(id: number, updateReviewDto: Partial<CreateReviewDto>): Promise<Review> {
    await this.reviewRepository.update(id, updateReviewDto);
    return this.reviewRepository.findOne({where:{id}});
  }

  async remove(id: number): Promise<void> {
    await this.reviewRepository.delete(id);
  }
}
