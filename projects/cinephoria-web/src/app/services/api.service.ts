import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Base URL for API requests
  private readonly baseUrl = environment.apiURL;

  // Constructor
  constructor(private http: HttpClient) {}

  // Method to get the API status
  getStatus(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.baseUrl}/health`);
  }
}
