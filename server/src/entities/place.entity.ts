import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Category } from './category.entity'
import { Review } from './review.entity';
@Entity()
export class Place {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('double precision', { array: true })
  coordinates: number[];

  @Column()
  description: string;

  @Column()
  audio: string;

  @Column('int', { array: true })
  ratings: number[];

  @Column('text', { array: true })
  photos: string[];

  @ManyToMany(() => Category)
  @JoinTable()
  categories: Category[];

  @OneToMany(() => Review, review => review.place)
  reviews: Review[];
}

