// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Ya no necesitas declararlo en NgModule
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000'; // Ajusta tu URL de FastAPI

  constructor(private http: HttpClient) {}

  activateAssistant(): Observable<any> {
    return this.http.post(`${this.apiUrl}/ia_asistente`, {});
  }

  getItems() {
    return this.http.get<any[]>(`${this.apiUrl}/itemsLists`);  // Endpoint de FastAPI (GET /items)
  }

  // api.service.ts - Solo asegúrate de tener este método
  deleteItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${itemId}`);
  }

  // api.service.ts - Agrega este método
    updateItem(itemId: number, itemData: any): Observable<any> {
      return this.http.put(`${this.apiUrl}/items/${itemId}`, itemData);
    }
}