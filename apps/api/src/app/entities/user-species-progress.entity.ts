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
import { SpeciesEntity } from './species.entity';

@Entity('user_species_progress')
@Unique(['userId', 'speciesId']) // Each user can only have one progress record per species
export class UserSpeciesProgressEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  speciesId: number;

  @Column({ type: 'int', default: 0 })
  timesSeen: number;

  @Column({ type: 'int', default: 0 })
  timesCorrect: number;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen?: Date;

  @Column({ type: 'float', default: 0 })
  accuracy: number; // timesCorrect / timesSeen

  @Column({ type: 'int', default: 0 })
  masteryLevel: number; // 0-5 scale

  @Column({ type: 'boolean', default: false })
  isMastered: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @ManyToOne(() => SpeciesEntity)
  @JoinColumn({ name: 'speciesId' })
  species?: SpeciesEntity;
}
