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
      error: (err) => {
        console.error('Error fetching dashboard stats', err);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  triggerLiveEvent(): void {
    this.isTriggering = true;
    this.dashboardService.triggerLiveEvent().subscribe({
      next: (item) => {
        this.isTriggering = false;
        this.cdr.markForCheck();
      },
      error: () => {
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
