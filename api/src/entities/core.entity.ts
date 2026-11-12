import { PrimaryGeneratedColumn } from 'typeorm';
import { SoftDeleteTimestamp, Timestamp } from './timestamp.entity';

export abstract class CoreEntity extends Timestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

export abstract class CoreSoftDeleteEntity extends SoftDeleteTimestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
