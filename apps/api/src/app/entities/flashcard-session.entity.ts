import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('flashcard_sessions')
export class FlashcardSessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'int', array: true })
  speciesIds: number[]; // Array of species IDs in this session

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ type: 'int', nullable: true })
  totalCards?: number;

  @Column({ type: 'int', default: 0 })
  correctAnswers: number;

  @Column({ type: 'int', default: 0 })
  incorrectAnswers: number;

  @Column({ type: 'float', nullable: true })
  accuracy?: number; // correctAnswers / totalCards

  @Column({ type: 'int', nullable: true })
  duration?: number; // seconds

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;
}
