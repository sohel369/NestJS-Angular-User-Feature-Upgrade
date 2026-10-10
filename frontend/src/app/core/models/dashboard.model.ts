export interface MetricCardData {
  label: string;
  value: number | string;
  change: string;
  isPositive: boolean;
}

export interface ActivityDistribution {
  type: string;
  count: number;
}

export interface ActivityTrends {
  timestamps: string[];
  logins: number[];
  updates: number[];
  transactions: number[];
}

export interface RecentActivityItem {
  id: string;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  activityType: 'LOGIN' | 'PROFILE_UPDATE' | 'AVATAR_UPLOAD' | 'TRANSACTION' | 'EXPORT';
  description: string;
  value: number;
  createdAt: string;
}

export interface DashboardStatsResponse {
  metrics: {
    totalUsers: MetricCardData;
    activeSessions: MetricCardData;
    totalTransactions: MetricCardData;
    systemHealth: MetricCardData;
  };
  activityDistribution: ActivityDistribution[];
  activityTrends: ActivityTrends;
  recentActivities: RecentActivityItem[];
  timestamp: string;
}
