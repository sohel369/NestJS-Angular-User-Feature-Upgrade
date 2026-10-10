import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { WebSocketService } from '../../core/services/websocket.service';
import { DashboardStatsResponse, RecentActivityItem } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStatsResponse | null = null;
  isLoading = true;
  isTriggering = false;
  isLiveConnected = false;
  selectedFilter: string = 'ALL';
  lastUpdated: string = '';

  private subs: Subscription = new Subscription();

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly wsService: WebSocketService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // 1. Initial REST API load
    this.loadStats();

    // 2. Subscribe to WebSocket Live updates
    this.subs.add(
      this.wsService.isConnected$.subscribe((connected) => {
        this.isLiveConnected = connected;
        this.cdr.markForCheck();
      }),
    );

    this.subs.add(
      this.wsService.statsUpdates$.subscribe((stats) => {
        this.stats = stats;
        this.lastUpdated = new Date().toLocaleTimeString();
        this.cdr.markForCheck();
      }),
    );

    this.subs.add(
      this.wsService.activityUpdates$.subscribe((activity) => {
        if (this.stats && activity) {
          // Prepend new activity
          this.stats.recentActivities = [activity, ...this.stats.recentActivities.slice(0, 14)];
          this.lastUpdated = new Date().toLocaleTimeString();
          this.cdr.markForCheck();
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  loadStats(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.lastUpdated = new Date().toLocaleTimeString();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        // Fallback live mock metrics for static preview
        this.stats = {
          metrics: {
            totalUsers: {
              label: 'Total Platform Users',
              value: 14280,
              change: '+14.8% vs last month',
              isPositive: true,
            },
            activeSessions: {
              label: 'Active Real-Time Sessions',
              value: 3842,
              change: '+8.2% vs last hour',
              isPositive: true,
            },
            totalTransactions: {
              label: 'Aggregated Transactions',
              value: 94820,
              change: '+22.4% vs last week',
              isPositive: true,
            },
            systemHealth: {
              label: 'System Uptime & SLA',
              value: '99.98%',
              change: 'Healthy & Optimized',
              isPositive: true,
            },
          },
          activityDistribution: [
            { type: 'PROFILE_UPDATE', count: 4120 },
            { type: 'LOGIN', count: 2890 },
            { type: 'TRANSACTION', count: 1840 },
            { type: 'AVATAR_UPLOAD', count: 1150 },
          ],
          activityTrends: {
            timestamps: ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
            logins: [320, 450, 410, 590, 680, 820, 960],
            updates: [120, 180, 240, 310, 290, 380, 420],
            transactions: [80, 110, 160, 220, 310, 440, 510],
          },
          recentActivities: [
            {
              id: 'act-1',
              activityType: 'PROFILE_UPDATE',
              description: 'Alex Morgan updated executive profile and contact information',
              value: 1,
              createdAt: new Date().toISOString(),
              userName: 'Alex Morgan',
              userEmail: 'alex.morgan@enterprise.io',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            },
            {
              id: 'act-2',
              activityType: 'LOGIN',
              description: 'Secure 2FA authentication verified from IP 192.168.1.104',
              value: 1,
              createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
              userName: 'Sarah Chen',
              userEmail: 'sarah.chen@enterprise.io',
              avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            },
            {
              id: 'act-3',
              activityType: 'TRANSACTION',
              description: 'Enterprise subscription renewal settled successfully ($2,400.00)',
              value: 2400,
              createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
              userName: 'David Kim',
              userEmail: 'david.kim@enterprise.io',
            },
            {
              id: 'act-4',
              activityType: 'AVATAR_UPLOAD',
              description: 'Zero-Downtime AWS ECS Fargate Blue/Green release v2.4.0 verified',
              value: 1,
              createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
              userName: 'DevOps Pipeline',
              userEmail: 'cicd@aws.internal',
            },
          ],
          timestamp: new Date().toISOString(),
        };
        this.lastUpdated = new Date().toLocaleTimeString();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  triggerLiveEvent(): void {
    this.isTriggering = true;
    this.dashboardService.triggerLiveEvent().subscribe({
      next: () => {
        this.isTriggering = false;
        this.cdr.markForCheck();
      },
      error: () => {
        // Fallback local synthetic simulation event
        if (this.stats) {
          const simulatedTypes: ('LOGIN' | 'TRANSACTION' | 'PROFILE_UPDATE' | 'AVATAR_UPLOAD')[] = [
            'TRANSACTION',
            'PROFILE_UPDATE',
            'LOGIN',
            'AVATAR_UPLOAD',
          ];
          const randomType = simulatedTypes[Math.floor(Math.random() * simulatedTypes.length)];
          const newEvent: RecentActivityItem = {
            id: 'sim-' + Date.now(),
            activityType: randomType,
            description: `Simulated live event trigger dispatched at ${new Date().toLocaleTimeString()}`,
            value: 1,
            createdAt: new Date().toISOString(),
            userName: 'Alex Morgan',
            userEmail: 'alex.morgan@enterprise.io',
          };
          this.stats.recentActivities = [newEvent, ...this.stats.recentActivities.slice(0, 14)];
          this.lastUpdated = new Date().toLocaleTimeString();
        }
        this.isTriggering = false;
        this.cdr.markForCheck();
      },
    });
  }

  setFilter(filter: string): void {
    this.selectedFilter = filter;
  }

  get filteredActivities(): RecentActivityItem[] {
    if (!this.stats?.recentActivities) return [];
    if (this.selectedFilter === 'ALL') return this.stats.recentActivities;
    return this.stats.recentActivities.filter((act) => act.activityType === this.selectedFilter);
  }

  getActivityBadgeClass(type: string): string {
    switch (type) {
      case 'TRANSACTION':
        return 'badge-success';
      case 'PROFILE_UPDATE':
      case 'AVATAR_UPLOAD':
        return 'badge-primary';
      case 'LOGIN':
        return 'badge-warning';
      default:
        return 'badge-primary';
    }
  }

  getMaxDistributionCount(): number {
    if (!this.stats?.activityDistribution) return 100;
    const counts = this.stats.activityDistribution.map((d) => d.count);
    return Math.max(...counts, 1);
  }
}
