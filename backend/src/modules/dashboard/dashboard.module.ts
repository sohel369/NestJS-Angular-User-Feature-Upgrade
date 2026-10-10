import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardGateway } from './dashboard.gateway';
import { User } from '../../database/entities/user.entity';
import { ActivityLog } from '../../database/entities/activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ActivityLog])],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardGateway],
  exports: [DashboardService],
})
export class DashboardModule {}
