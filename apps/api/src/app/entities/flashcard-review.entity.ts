import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { SpeciesEntity } from './species.entity';

export type ReviewResult = 'correct' | 'incorrect';

@Entity('flashcard_reviews')
export class FlashcardReviewEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: string;

  @Column()
  speciesId!: number;

  @Column({ type: 'enum', enum: ['correct', 'incorrect'] })
  result!: ReviewResult;

  @Column({ type: 'timestamp' })
  reviewedAt!: Date;

  @Column({ type: 'int', nullable: true })
  responseTime?: number; // milliseconds

  @Column({ type: 'float', nullable: true })
  difficulty?: number; // 0-5 scale

  @Column({ type: 'int', nullable: true })
  interval?: number; // days until next review

  @Column({ type: 'int', nullable: true })
  repetitions?: number; // number of times reviewed

  @Column({ type: 'float', nullable: true })
  easeFactor?: number; // SuperMemo ease factor

  @Column({ type: 'timestamp', nullable: true })
  nextReviewDate?: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @ManyToOne(() => SpeciesEntity)
  @JoinColumn({ name: 'speciesId' })
  species?: SpeciesEntity;
}
