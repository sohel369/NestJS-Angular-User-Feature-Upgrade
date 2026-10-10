import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityType {
  LOGIN = 'LOGIN',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  AVATAR_UPLOAD = 'AVATAR_UPLOAD',
  TRANSACTION = 'TRANSACTION',
  EXPORT = 'EXPORT',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column({
    type: 'enum',
    enum: ActivityType,
    default: ActivityType.LOGIN,
  })
  activityType: ActivityType;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  value: number;

  @Index()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
