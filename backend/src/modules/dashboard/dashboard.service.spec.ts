import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { User, UserStatus } from '../../database/entities/user.entity';
import { ActivityLog, ActivityType } from '../../database/entities/activity-log.entity';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockUserRepository = {
    count: jest.fn(),
    find: jest.fn(),
  };

  const createQueryBuilderMock: any = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ totalValue: '1500.00', count: '12' }),
    getRawMany: jest.fn().mockResolvedValue([
      { type: ActivityType.LOGIN, count: '45' },
      { type: ActivityType.TRANSACTION, count: '12' },
    ]),
  };

  const mockActivityRepository = {
    createQueryBuilder: jest.fn().mockReturnValue(createQueryBuilderMock),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(ActivityLog),
          useValue: mockActivityRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAggregatedStats', () => {
    it('should calculate PostgreSQL aggregated counts and return complete dashboard stats', async () => {
      mockUserRepository.count
        .mockResolvedValueOnce(25) // totalUsers
        .mockResolvedValueOnce(18); // activeUsers

      mockActivityRepository.find.mockResolvedValue([
        {
          id: 'log-1',
          activityType: ActivityType.LOGIN,
          description: 'User login',
          value: 0,
          createdAt: new Date(),
          user: { name: 'Alex Morgan', email: 'alex@company.io', profile: {} },
        },
      ]);

      const stats = await service.getAggregatedStats();

      expect(stats).toBeDefined();
      expect(stats.metrics.totalUsers.value).toEqual(25);
      expect(stats.metrics.activeSessions.value).toEqual(18);
      expect(stats.metrics.totalTransactions.value).toContain('1,500.00');
      expect(stats.activityDistribution.length).toBeGreaterThan(0);
      expect(stats.recentActivities.length).toBe(1);
    });
  });
});
