// big-calendar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ItemService } from '../../services/item.service';

interface Activity {
  id?: number;
  title: string;
  hour: number;
  color: string;
}

@Component({
  selector: 'app-big-calendar',
  templateUrl: './big-calendar.component.html',
  styleUrls: ['./big-calendar.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class BigCalendarComponent implements OnInit, OnDestroy {
  weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
  activitiesByDay: Activity[][] = Array(7).fill(null).map(() => []);

  private subscription!: Subscription;

  constructor(
    private apiService: ApiService,
    private itemService: ItemService
  ) {}

  ngOnInit(): void {
    this.loadActivities();

    this.subscription = this.itemService.itemCreated$.subscribe(() => {
      this.loadActivities();
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // ✅ Método auxiliar: obtiene el lunes de la semana (a las 00:00 hora local)
  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay(); // 0 = dom, 1 = lun, ..., 6 = sáb
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(d.getFullYear(), d.getMonth(), diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  // ✅ Cargar actividades (CORREGIDO: parseo en hora local)
  loadActivities(): void {
    this.apiService.getItems().subscribe({
      next: (items) => {
        this.activitiesByDay = Array(7).fill(null).map(() => []);

        const startOfWeek = this.getStartOfWeek(new Date());

        items.forEach(item => {
          if (!item.date || typeof item.date !== 'string') return;

          // ✅ PARSEAR "YYYY-MM-DD" EN HORA LOCAL (evita desfase UTC)
          const dateParts = item.date.split('-');
          if (dateParts.length !== 3) return;

          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // mes es 0-indexado
          const day = parseInt(dateParts[2], 10);

          if (isNaN(year) || isNaN(month) || isNaN(day)) return;

          const itemDate = new Date(year, month, day);
          itemDate.setHours(0, 0, 0, 0);

          // Calcular diferencia en días
          const diffInMs = itemDate.getTime() - startOfWeek.getTime();
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

          if (diffInDays >= 0 && diffInDays < 7) {
            this.activitiesByDay[diffInDays].push({
              id: item.id,
              title: item.description || 'Sin descripción',
              hour: item.hour,
              color: this.getRandomColor(),
            });
          }
        });

        console.log('Actividades cargadas:', this.activitiesByDay);
      },
      error: (err) => {
        console.error('Error al cargar actividades:', err);
      }
    });
  }

  // ✅ Obtener número del día (CORREGIDO: usa fecha real)
  getDayNumber(index: number): number {
    const startOfWeek = this.getStartOfWeek(new Date());
    const targetDate = new Date(startOfWeek.getTime() + index * 24 * 60 * 60 * 1000);
    return targetDate.getDate();
  }

  // ✅ Genera un color aleatorio
  private getRandomColor(): string {
    const colors = [
      '#dc3545', // Rojo
      '#fd7e14', // Naranja
      '#ffc107', // Amarillo
      '#20c997', // Verde
      '#0d6efd', // Azul
      '#6f42c1', // Púrpura
      '#6c757d'  // Gris
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // ✅ Eliminar actividades del día
  confirmDelete(dayIndex: number): void {
    const activities = this.getActivitiesForDay(dayIndex);
    
    if (activities.length === 0) {
      alert('No hay actividades para eliminar en este día');
      return;
    }

    if (confirm(`¿Eliminar todas las actividades del ${this.weekDays[dayIndex]}? (Total: ${activities.length})`)) {
      activities.forEach(activity => {
        if (activity.id) {
          this.apiService.deleteItem(activity.id).subscribe({
            next: () => {
              console.log('Actividad eliminada:', activity.id);
              this.loadActivities();
            },
            error: (err) => {
              console.error('Error al eliminar actividad:', err);
            }
          });
        }
      });
    }
  }

  // ✅ Formatear hora
  formatHour(hour: number): string {
    return `${hour}`;
  }

  // ✅ Truncar título
  getTruncatedTitle(title: string): string {
    return title.length > 14 ? title.substring(0, 14) + '...' : title;
  }

  // ✅ Obtener actividades por día
  getActivitiesForDay(dayIndex: number): Activity[] {
    return this.activitiesByDay[dayIndex] || [];
  }
}