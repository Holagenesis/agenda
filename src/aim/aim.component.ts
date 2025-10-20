import { Component } from '@angular/core';
import { ApiService2 } from '../services/api.service2';
import { ItemService } from '../services/item.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aim',
  imports: [CommonModule],
  templateUrl: './aim.component.html',
  styleUrl: './aim.component.css'
})
export class AimComponent {
  isLoading = false;
  response: any;
  error: string | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  isRecording = false;
  
  // PROPIEDADES PARA DUPLICADOS
  showDuplicateWarning = false;
  duplicateMessage = '';
  pendingActivity: any = null;

  constructor(
    private apiService2: ApiService2,
    private itemService: ItemService
  ) {}

  async startRecording() {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.audioChunks = [];
    // Resetear estados de duplicado
    this.showDuplicateWarning = false;
    this.duplicateMessage = '';
    this.pendingActivity = null;
    this.response = null; // ← AÑADIR ESTO
    this.error = null;    // ← AÑADIR ESTO
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.start();
    } catch (err) {
      this.error = 'No se pudo acceder al micrófono';
      console.error(err);
      this.isRecording = false;
      this.isLoading = false;
    }
  }

  async stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;
    
    this.isRecording = false;
    this.isLoading = true;
    this.error = null;

    return new Promise<void>((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        try {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          await this.sendAudioToBackend(audioBlob);
        } catch (error) {
          this.error = 'Error al procesar el audio';
          console.error(error);
        } finally {
          this.cleanup();
          resolve();
        }
      };

      this.mediaRecorder!.stop();
      this.cleanupStream();
    });
  }

  private cleanup() {
    this.isLoading = false;
    this.mediaRecorder = null;
  }

  private cleanupStream() {
    if (this.mediaRecorder?.stream) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  private async sendAudioToBackend(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const data = await this.apiService2.sendAudioToAssistant(formData).toPromise();
      
      // **CAMBIOS PRINCIPALES AQUÍ** - MANEJO DE DUPLICADOS
      if (data.status === 'duplicate_warning') {
        // Mostrar modal de duplicados
        this.showDuplicateWarning = true;
        this.duplicateMessage = `Ya existe una actividad similar: "${data.existing_activity.description}" para la misma fecha. ¿Deseas agregarla igualmente?`;
        this.pendingActivity = {
          user_input: data.user_input,
          new_activity: data.new_activity
        };
        this.response = { message: data.message };
        
      } else if (data.status === 'success') {
        // Comportamiento normal
        this.response = data;
        this.itemService.notifyItemCreated();
      } else {
        this.response = data;
        this.error = data.agent_response || 'Error al procesar';
      }
      
    } catch (err) {
      this.error = 'Error al procesar el audio';
      throw err;
    }
  }

  // **MÉTODOS ACTUALIZADOS PARA DUPLICADOS**
  async confirmDuplicate() {
    if (this.pendingActivity) {
      this.isLoading = true;
      this.showDuplicateWarning = false;
      
      try {
        // Enviar confirmación al backend para crear el duplicado
        const confirmData = {
          user_input: this.pendingActivity.user_input,
          new_activity: this.pendingActivity.new_activity,
          skip_duplicate_check: true
        };
        
        // Necesitarás crear este método en tu ApiService2
        const result = await this.apiService2.confirmDuplicateActivity(confirmData).toPromise();
        
        if (result.status === 'success') {
          this.response = { message: `✅ '${this.pendingActivity.new_activity.description}' agendado exitosamente` };
          this.itemService.notifyItemCreated();
        } else {
          this.error = 'Error al confirmar la actividad duplicada';
        }
        
      } catch (error) {
        this.error = 'Error al procesar la confirmación';
        console.error(error);
      } finally {
        this.isLoading = false;
        this.pendingActivity = null;
        this.duplicateMessage = '';
      }
    }
  }

  cancelDuplicate() {
    this.response = { message: '❌ Agendamiento cancelado' };
    this.showDuplicateWarning = false;
    this.duplicateMessage = '';
    this.pendingActivity = null;
  }

  // Manejo para dispositivos táctiles
  onTouchStart(event: TouchEvent) {
    event.preventDefault();
    this.startRecording();
  }

  onTouchEnd(event: TouchEvent) {
    event.preventDefault();
    this.stopRecording();
  }
}