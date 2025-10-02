import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpeciesEntity } from './species.entity';

@Entity('species_common_names')
export class SpeciesCommonNameEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  speciesId!: number;

  @Column({ type: 'varchar', length: 10 })
  langCode!: string;

  @Column({ type: 'varchar', length: 255 })
  commonName!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne(() => SpeciesEntity)
  @JoinColumn({ name: 'speciesId' })
  species?: SpeciesEntity;
}
