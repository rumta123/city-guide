// src/entities/review.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Place } from './place.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  author: string;

  @Column()
  text: string;

  @Column()
  rating: number;

  @ManyToOne(() => Place, place => place.reviews)
  place: Place;
}
