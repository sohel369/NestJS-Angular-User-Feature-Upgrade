import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { DashboardStatsResponse, RecentActivityItem } from '../models/dashboard.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly apiUrl = '/api/dashboard';

  constructor(private readonly http: HttpClient) {}

  getDashboardStats(): Observable<DashboardStatsResponse> {
    return this.http.get<DashboardStatsResponse>(`${this.apiUrl}/stats`).pipe(
      catchError((error) => {
        console.error('Error fetching dashboard stats', error);
        return throwError(() => error);
      }),
    );
  }

  triggerLiveEvent(): Observable<RecentActivityItem> {
    return this.http.post<RecentActivityItem>(`${this.apiUrl}/trigger-event`, {}).pipe(
      catchError((error) => {
        console.error('Error triggering live event', error);
        return throwError(() => error);
      }),
    );
  }
}
