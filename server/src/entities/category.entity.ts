import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Place } from './place.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Place, place => place.categories)
  places: Place[];

  // Дополнительные поля и методы
}