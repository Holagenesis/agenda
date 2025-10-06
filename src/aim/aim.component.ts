import { Component } from '@angular/core';
import { ApiService2 } from '../services/api.service2';  // ✅ Más limpio
import { ItemService } from '../services/item.service';  // Importa el servicio
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

  constructor(
    private apiService2: ApiService2,
    private itemService: ItemService
  ) {}

  async startRecording() {
    if (this.isRecording) return;
    
    this.isRecording = true;
    this.audioChunks = [];
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
      this.response = data;
      this.itemService.notifyItemCreated();
    } catch (err) {
      this.error = 'Error al procesar el audio';
      throw err;
    }
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