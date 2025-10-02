import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { ConservationStatus } from '@birdguide/shared-types';

@Entity('species')
export class SpeciesEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  scientificName!: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  eBirdId!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  genus?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  family?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  orderName?: string;

  @Column({
    type: 'enum',
    enum: ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'],
    nullable: true,
  })
  iucnStatus?: ConservationStatus;

  @Column({ type: 'int', nullable: true })
  sizeMm?: number;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  rangeMapUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
