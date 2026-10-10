import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { UserProfile, UpdateProfileRequest } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly apiUrl = '/api/profiles';

  constructor(private readonly http: HttpClient) {}

  getAllProfiles(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error('Error fetching profiles', error);
        return throwError(() => error);
      }),
    );
  }

  getProfile(userId: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${userId}`).pipe(
      catchError((error) => {
        console.error(`Error fetching profile for ${userId}`, error);
        return throwError(() => error);
      }),
    );
  }

  updateProfile(userId: string, request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/${userId}`, request).pipe(
      catchError((error) => {
        console.error(`Error updating profile for ${userId}`, error);
        return throwError(() => error);
      }),
    );
  }

  uploadAvatar(userId: string, file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/${userId}/avatar`, formData).pipe(
      catchError((error) => {
        console.error(`Error uploading avatar for ${userId}`, error);
        return throwError(() => error);
      }),
    );
  }
}
