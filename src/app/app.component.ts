import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Importa solo los componentes que usas en el template
import { AimComponent } from '../aim/aim.component';
import { ItemListComponent } from '../item-list/item-list.component';
import { HomeComponent } from '../home/home.component';
import { MenuComponent } from '../menu/menu.component';
import { BigCalendarComponent } from './big-calendar/big-calendar.component';

@Component({
  selector: 'app-root',
  standalone: true, // Asegúrate de que esto esté
  imports: [ 
    
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    HttpClientModule,
    // Solo importa los componentes que usas en el template
    ItemListComponent,
    AimComponent,
    HomeComponent,
    MenuComponent,
    BigCalendarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'proyecto';
  // Por defecto, mostramos el 'dashboard'
  vistaActual: 'dashboard' | 'calendario' = 'dashboard';

  // ✅ Conteo de actividades de HOY
  todayActivityCount: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadTodayActivityCount();
  }

   // ✅ Cargar el conteo de actividades de hoy
  private loadTodayActivityCount(): void {
    this.apiService.getItems().subscribe({
      next: (items) => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // "YYYY-MM-DD"

        this.todayActivityCount = items.filter(item => 
          item.date === todayStr
        ).length;
      },
      error: (err) => {
        console.error('Error al cargar conteo de hoy:', err);
        this.todayActivityCount = 0;
      }
    });
  }

  cambiarVista(vista: 'dashboard' | 'calendario') {
    this.vistaActual = vista;
    
    // ✅ Opcional: recargar el conteo si vuelves al dashboard
    if (vista === 'dashboard') {
      this.loadTodayActivityCount();
    }
  }
}