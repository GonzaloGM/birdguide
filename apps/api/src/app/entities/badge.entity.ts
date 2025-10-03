import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('badges')
@Unique(['name']) // Badge names must be unique
export class BadgeEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // e.g., 'first_review', 'ten_correct', 'three_day_streak'

  @Column()
  title: string; // e.g., 'First Review', 'Quick Learner', 'Consistent'

  @Column({ type: 'text' })
  description: string; // e.g., 'Complete your first flashcard review'

  @Column({ nullable: true })
  icon?: string; // e.g., 'star', 'trophy', 'fire'

  @Column({ nullable: true })
  color?: string; // e.g., 'gold', 'silver', 'bronze'

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
