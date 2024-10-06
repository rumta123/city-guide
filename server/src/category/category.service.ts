// category.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find();
  }

  async findOne(id: number): Promise<Category> {
    return this.categoryRepository.findOne({where:{id}});
  }

  async create(categoryData: Partial<Category>): Promise<Category> {
    const newCategory = this.categoryRepository.create(categoryData);
    return this.categoryRepository.save(newCategory);
  }

  async update(id: number, categoryData: Partial<Category>): Promise<Category> {
    await this.categoryRepository.update(id, categoryData);
    return this.categoryRepository.findOne({where:{id}});
  }

  async remove(id: number): Promise<void> {
    await this.categoryRepository.delete(id);
  }
}
