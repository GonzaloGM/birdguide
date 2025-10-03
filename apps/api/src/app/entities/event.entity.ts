import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { UserEntity } from './user.entity';

export type EventType =
  | 'flashcard_review'
  | 'session_started'
  | 'session_completed'
  | 'badge_earned'
  | 'streak_updated'
  | 'xp_gained'
  | 'species_mastered';

@Entity('events')
@Index(['userId', 'eventType']) // Index for efficient querying by user and event type
@Index(['timestamp']) // Index for time-based queries
export class EventEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({
    type: 'enum',
    enum: [
      'flashcard_review',
      'session_started',
      'session_completed',
      'badge_earned',
      'streak_updated',
      'xp_gained',
      'species_mastered',
    ],
  })
  eventType: EventType;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>; // Flexible JSON data for event-specific information

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;
}
