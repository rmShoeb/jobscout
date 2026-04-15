import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Job } from '../models/job.model';
import { SearchCriteria } from '../components/search-menu/search-menu.component';
import { environment } from '../../environments/environment';

export interface SearchResponse {
  jobs: Job[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`).pipe(
      catchError(this.handleError)
    );
  }

  searchJobs(criteria: SearchCriteria, page: number): Observable<SearchResponse> {
    const payload = { ...criteria, page };
    return this.http.post<SearchResponse>(`${this.apiUrl}/search`, payload).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred processing your request.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Network Error: ${error.error.message}`;
    } else {
      // Safely parse FastAPI's specific detail string to avoid dumping ugly HTTP raw strings to the user
      errorMessage = error.error?.detail || `A server error occurred (Code ${error.status}). Please try again later.`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
