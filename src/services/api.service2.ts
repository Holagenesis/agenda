import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService2 {
  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  sendAudioToAssistant(audioData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/ia_asistente2`, audioData);
  }
}