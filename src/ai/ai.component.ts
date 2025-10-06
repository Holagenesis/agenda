import { Component } from '@angular/core';
import { ApiService } from '../services/api.service';  // ✅ Más limpio
import { ItemService } from '../services/item.service';  // Importa el servicio

@Component({
  selector: 'app-ai',
  imports: [],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.css'
})
export class AiComponent {
  isLoading = false;
  response: any;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private itemService: ItemService  // Inyecta el servicio
  ) {}

  activateAssistant() {
    this.isLoading = true;
    this.error = null;
    
    this.apiService.activateAssistant().subscribe({
      next: (data) => {
        this.response = data;
        this.isLoading = false;
        this.itemService.notifyItemCreated();  // ¡Notifica que se creó un item!
      },
      error: (err) => {
        this.error = err.message || 'Error al activar el asistente';
        this.isLoading = false;
      }
    });
  }

}
