import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { DashboardStatsResponse, RecentActivityItem } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket!: Socket;
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();

  private statsSubject = new Subject<DashboardStatsResponse>();
  public statsUpdates$ = this.statsSubject.asObservable();

  private activitySubject = new Subject<RecentActivityItem>();
  public activityUpdates$ = this.activitySubject.asObservable();

  constructor(private readonly zone: NgZone) {
    this.initSocket();
  }

  private initSocket(): void {
    const wsUrl = window.location.origin; // In development or proxy, or direct port 3000
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      this.zone.run(() => {
        console.log('⚡ Connected to WebSocket Gateway:', this.socket.id);
        this.isConnectedSubject.next(true);
      });
    });

    this.socket.on('disconnect', () => {
      this.zone.run(() => {
        console.warn('⚠️ Disconnected from WebSocket Gateway');
        this.isConnectedSubject.next(false);
      });
    });

    this.socket.on('dashboardStatsUpdated', (stats: DashboardStatsResponse) => {
      this.zone.run(() => {
        this.statsSubject.next(stats);
      });
    });

    this.socket.on('newActivityStream', (activity: RecentActivityItem) => {
      this.zone.run(() => {
        this.activitySubject.next(activity);
      });
    });
  }

  public requestStats(): void {
    if (this.socket && this.socket.connected) {
      this.socket.emit('requestStats');
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
