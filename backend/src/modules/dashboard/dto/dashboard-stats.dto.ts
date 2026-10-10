export interface MetricCard {
  label: string;
  value: number | string;
  change: string;
  isPositive: boolean;
}

export interface ActivityDistribution {
  type: string;
  count: number;
}

export interface RecentActivityItem {
  id: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  activityType: string;
  description: string;
  value: number;
  createdAt: string;
}

export interface DashboardStatsDto {
  metrics: {
    totalUsers: MetricCard;
    activeSessions: MetricCard;
    totalTransactions: MetricCard;
    systemHealth: MetricCard;
  };
  activityDistribution: ActivityDistribution[];
  activityTrends: {
    timestamps: string[];
    logins: number[];
    updates: number[];
    transactions: number[];
  };
  recentActivities: RecentActivityItem[];
  timestamp: string;
}
