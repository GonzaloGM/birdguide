import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { BadgeEntity } from './badge.entity';

@Entity('user_badges')
@Unique(['userId', 'badgeId']) // Each user can only earn each badge once
export class UserBadgeEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  badgeId!: number;

  @Column({ type: 'timestamp' })
  earnedAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @ManyToOne(() => BadgeEntity)
  @JoinColumn({ name: 'badgeId' })
  badge?: BadgeEntity;
}
