import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Place } from '../entities/place.entity';
import { CreatePlaceDto } from '../dto/create-place.dto';
import { Category } from 'src/entities/category.entity';
import { Review } from '../entities/review.entity';
import { CreateReviewDto } from 'src/dto/create-review.dto';
@Injectable()
export class PlacesService {
  create(createPlaceDto: CreatePlaceDto) {
      throw new Error('Method not implemented.');
  }

  constructor(
    @InjectRepository(Place)
    private placesRepository: Repository<Place>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async findAll(): Promise<Place[]> {
    return this.placesRepository.find({ relations: ['categories', 'reviews'] });
  }

  findOne(id: number): Promise<Place> {
    return this.placesRepository.findOne({ where: { id }, relations: ['categories', 'reviews'] });
  }

  async createPlace(createPlaceDto: CreatePlaceDto): Promise<Place> {
    const { categoryIds, ...rest } = createPlaceDto;

    const place = new Place();
    Object.assign(place, rest);

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepository.findByIds(categoryIds);
      place.categories = categories;
    }

    return this.placesRepository.save(place);
  }

  async update(id: number, updatePlaceDto: Partial<CreatePlaceDto>): Promise<Place> {
    const { categoryIds, ...rest } = updatePlaceDto;
  
    const updatedPlace = await this.placesRepository.findOne({where:{id}});
    if (!updatedPlace) {
      throw new Error(`Place with id ${id} not found`);
    }
  
    // Метод Object.assign используется для копирования свойств из rest в объект updatedPlace
    Object.assign(updatedPlace, rest);
  
    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepository.findByIds(categoryIds);
      updatedPlace.categories = categories;
    }
  
    return this.placesRepository.save(updatedPlace);
  }
  
  

  async remove(id: number): Promise<void> {
    await this.placesRepository.delete(id);
  }

  async addReview(placeId: number, createReviewDto: CreateReviewDto): Promise<Review> {
    const place = await this.placesRepository.findOne({ where: { id: placeId } });
    if (!place) {
        throw new NotFoundException(`Place with id ${placeId} not found`);
    }

    const review = new Review();
    Object.assign(review, createReviewDto);
    review.place = place;

    return this.reviewRepository.save(review);
}

}

