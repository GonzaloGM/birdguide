import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SpeciesEntity } from './species.entity';

@Entity('species_media')
export class SpeciesMediaEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  speciesId!: number;

  @Column()
  mediaType!: string; // 'photo', 'audio', 'spectrogram'

  @Column()
  url!: string;

  @Column({ nullable: true })
  thumbnailUrl?: string;

  @Column({ nullable: true })
  durationSeconds?: number; // for audio files

  @Column({ nullable: true })
  contributor?: string; // 'John Doe / Macaulay Library'

  @Column({ nullable: true })
  source?: string; // 'macaulay', 'xeno-canto', 'wikimedia'

  @Column({ nullable: true })
  sourceId?: string; // original id in the source

  @Column({ nullable: true })
  attributionText?: string; // pre-built attribution string

  @Column({ default: 0 })
  qualityRank!: number; // 0 = unknown, higher = better

  @Column({ default: false })
  isDefault!: boolean; // preferred media for flashcards

  @Column({ nullable: true })
  date?: string; // date from the source

  @Column({ nullable: true })
  location?: string; // location from the source

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => SpeciesEntity)
  @JoinColumn({ name: 'speciesId' })
  species?: SpeciesEntity;
}
