import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentDate = signal(new Date());
  currentMonth = signal(this.currentDate().getMonth());
  currentYear = signal(this.currentDate().getFullYear());

  // Obtener días del mes actual
  getDaysInMonth() {
    const daysInMonth = new Date(
      this.currentYear(), 
      this.currentMonth() + 1, 
      0
    ).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

    // Cambiar mes (adelante/atrás)
    changeMonth(step: number) {
      const newMonth = this.currentMonth() + step;
      if (newMonth < 0 || newMonth > 11) {
        const newDate = new Date(this.currentYear(), newMonth, 1);
        this.currentYear.set(newDate.getFullYear());
        this.currentMonth.set(newDate.getMonth());
      } else {
        this.currentMonth.set(newMonth);
      }
    }

    // En tu componente
    weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    getMonthName(): string {
      const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return months[this.currentMonth()];
    }

    // Añade esta función para obtener el primer día de la semana del mes
    getFirstDayOfMonth(): number {
      return new Date(this.currentYear(), this.currentMonth(), 1).getDay();
    }

    getLeadingBlanks(): number[] {
      const firstDay = this.getFirstDayOfMonth();
      // Ajuste para que Lun=0, Dom=6
      const offset = firstDay === 0 ? 6 : firstDay - 1;
      return Array(offset).fill(0);
    }
}
