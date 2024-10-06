// category.controller.ts

import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Category } from '../entities/category.entity';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  async findAll(): Promise<Category[]> {
    return this.categoryService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Category> {
    return this.categoryService.findOne(+id);
  }

  @Post()
  async create(@Body() categoryData: Partial<Category>): Promise<Category> {
    return this.categoryService.create(categoryData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() categoryData: Partial<Category>): Promise<Category> {
    return this.categoryService.update(+id, categoryData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoryService.remove(+id);
  }
}
