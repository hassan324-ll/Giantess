import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { apiErrorHandler } from '../core/api-error';
import { environment } from '../../environments/environment';

export interface ContactPayload {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  privacyAccepted: boolean;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendContact(payload: ContactPayload): Observable<ContactResponse> {
    return this.http
      .post<ContactResponse>(`${this.baseUrl}/contact`, payload)
      .pipe(catchError(apiErrorHandler));
  }
}
