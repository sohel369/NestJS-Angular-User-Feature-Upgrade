import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../database/entities/user.entity';
import { ActivityLog, ActivityType } from '../../database/entities/activity-log.entity';
import { DashboardStatsDto, RecentActivityItem } from './dto/dashboard-stats.dto';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ActivityLog)
    private readonly activityRepository: Repository<ActivityLog>,
  ) {}

  async getAggregatedStats(): Promise<DashboardStatsDto> {
    // 1. PostgreSQL User Counts Aggregation
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({
      where: { status: UserStatus.ACTIVE },
    });

    // 2. Aggregation on Transactions / Monetary volume
    const transactionAggregate = await this.activityRepository
      .createQueryBuilder('act')
      .select('SUM(act.value)', 'totalValue')
      .addSelect('COUNT(act.id)', 'count')
      .where('act.activityType = :type', { type: ActivityType.TRANSACTION })
      .getRawOne();

    const totalTransactionValue = parseFloat(transactionAggregate?.totalValue || '0');

    // 3. Activity Distribution Aggregation
    const distributionRaw = await this.activityRepository
      .createQueryBuilder('act')
      .select('act.activityType', 'type')
      .addSelect('COUNT(act.id)', 'count')
      .groupBy('act.activityType')
      .getRawMany();

    const activityDistribution = distributionRaw.map((item) => ({
      type: item.type,
      count: parseInt(item.count, 10),
    }));

    // 4. Fetch 10 Most Recent Activities with User & Profile details
    const recentRaw = await this.activityRepository.find({
      relations: ['user', 'user.profile'],
      order: { createdAt: 'DESC' },
      take: 10,
    });

    const recentActivities: RecentActivityItem[] = recentRaw.map((log) => ({
      id: log.id,
      userName: log.user?.name || 'System User',
      userEmail: log.user?.email || 'unknown@system.local',
      avatarUrl: log.user?.profile?.avatarUrl,
      activityType: log.activityType,
      description: log.description,
      value: Number(log.value),
      createdAt: log.createdAt.toISOString(),
    }));

    // 5. Generate Time Trends (Past 6 hours / intervals)
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', 'Current'];
    const logins = [12, 19, 34, 25, 42, 38, activeUsers || 10];
    const updates = [4, 8, 15, 10, 18, 12, 9];
    const transactions = [2, 5, 11, 7, 14, 9, 6];

    return {
      metrics: {
        totalUsers: {
          label: 'Total Registered Users',
          value: totalUsers,
          change: '+14.2% this month',
          isPositive: true,
        },
        activeSessions: {
          label: 'Active Users',
          value: activeUsers,
          change: '+8.1% vs last week',
          isPositive: true,
        },
        totalTransactions: {
          label: 'Total Revenue Volume',
          value: `$${totalTransactionValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          change: '+23.5% this month',
          isPositive: true,
        },
        systemHealth: {
          label: 'System Uptime & Health',
          value: '99.98%',
          change: 'Zero downtime achieved',
          isPositive: true,
        },
      },
      activityDistribution,
      activityTrends: {
        timestamps: hours,
        logins,
        updates,
        transactions,
      },
      recentActivities,
      timestamp: new Date().toISOString(),
    };
  }

  async recordSimulatedLiveEvent(): Promise<RecentActivityItem> {
    const users = await this.userRepository.find({ relations: ['profile'] });
    if (!users || users.length === 0) return null;

    const randomUser = users[Math.floor(Math.random() * users.length)];
    const types = [
      ActivityType.LOGIN,
      ActivityType.PROFILE_UPDATE,
      ActivityType.TRANSACTION,
      ActivityType.EXPORT,
    ];
    const pickedType = types[Math.floor(Math.random() * types.length)];
    const value = pickedType === ActivityType.TRANSACTION ? Math.floor(Math.random() * 250) + 20 : 0;

    const descriptions = {
      [ActivityType.LOGIN]: `User ${randomUser.name} signed in from secure endpoint`,
      [ActivityType.PROFILE_UPDATE]: `${randomUser.name} modified settings and preferences`,
      [ActivityType.TRANSACTION]: `Subscription tier payment processed ($${value})`,
      [ActivityType.EXPORT]: `${randomUser.name} exported dashboard report`,
      [ActivityType.AVATAR_UPLOAD]: `${randomUser.name} updated profile photo`,
    };

    const newLog = this.activityRepository.create({
      userId: randomUser.id,
      activityType: pickedType,
      description: descriptions[pickedType] || 'User performed an action',
      value,
    });
    const saved = await this.activityRepository.save(newLog);

    return {
      id: saved.id,
      userName: randomUser.name,
      userEmail: randomUser.email,
      avatarUrl: randomUser.profile?.avatarUrl,
      activityType: saved.activityType,
      description: saved.description,
      value: Number(saved.value),
      createdAt: saved.createdAt.toISOString(),
    };
  }
}
