import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { User } from '../../database/entities/user.entity';
import { Profile } from '../../database/entities/profile.entity';
import { ActivityLog } from '../../database/entities/activity-log.entity';
import { StorageService } from '../../common/storage/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, ActivityLog])],
  controllers: [ProfileController],
  providers: [ProfileService, StorageService],
  exports: [ProfileService],
})
export class ProfileModule {}
